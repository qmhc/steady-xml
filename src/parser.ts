import { isNull, isString } from './shared'
import { XmlNodeType } from './node'
import { normalizeParseProps } from './props'

import type { TextValue, ParseProps } from './props'

const tagNotClosed = 'Tag is not closed.'

export function parseXmlString(xmlString: string, props: Partial<ParseProps> = {}) {
  const normalizedXml = xmlString.replace(/\r\n?/g, '\n')
  const normalizedProps = normalizeParseProps(props)
  const xmlLength = normalizedXml.length

  const XmlNode = normalizedProps.nodeClass

  const rootXmlNode = new XmlNode(XmlNodeType.Root)

  let currentNode = rootXmlNode
  let textData = ''

  for (let i = 0; i < xmlLength; i++) {
    const char = normalizedXml[i]

    if (char !== '<') {
      textData += char
    } else {
      if (normalizedXml[i + 1] === '/') {
        const endIndex = findEndIndexOrThrow(normalizedXml, '>', i, `Element End ${tagNotClosed}`)

        let tagName = normalizedXml.substring(i + 2, endIndex)
        let prefix = ''

        if (!normalizedProps.prefixInName) {
          const prefixIndex = tagName.indexOf(':')

          if (~prefixIndex) {
            prefix = tagName.substring(0, prefixIndex)
            tagName = tagName.substring(prefixIndex + 1)
          }
        }

        if (currentNode.getPrefix() !== prefix || currentNode.getName() !== tagName) {
          throw new Error(`End Tag is incorrect.`)
        }

        if (textData) {
          const textValue = toTextValue(
            processNodeValue('', XmlNodeType.Text, textData, normalizedProps)
          )

          if (textValue) {
            currentNode.addChild(new XmlNode(XmlNodeType.Text, currentNode, textValue))
          }
        }

        currentNode = currentNode.getParent()!
        textData = ''
        i = endIndex
      } else if (normalizedXml[i + 1] === '?') {
        const endIndex = findEndIndexOrThrow(
          normalizedXml,
          '?>',
          i,
          `Processing Instruction ${tagNotClosed}`
        )
        const content = normalizedXml.substring(i + 2, endIndex - 1)

        if (currentNode) {
          if (
            content.startsWith('xml ') &&
            content.includes('version=') &&
            currentNode.getType() === XmlNodeType.Root
          ) {
            const childNode = new XmlNode(XmlNodeType.Declaration, currentNode)

            childNode.setAttributes(
              parseAttributes(
                content.substr(4),
                XmlNodeType.Declaration,
                normalizedProps
              )
            )

            currentNode.addChild(childNode)
          } else {
            currentNode.addChild(
              new XmlNode(
                XmlNodeType.Instruction,
                currentNode,
                processNodeValue('', XmlNodeType.Instruction, content, normalizedProps)
              )
            )
          }
        }

        i = endIndex
      } else if (normalizedXml.substr(i + 1, 3) === '!--') {
        const endIndex = findEndIndexOrThrow(normalizedXml, '-->', i, `Comment ${tagNotClosed}`)
        const content = normalizedXml.substring(i + 4, endIndex - 2)

        if (currentNode) {
          currentNode.addChild(
            new XmlNode(
              XmlNodeType.Comment,
              currentNode,
              processNodeValue('', XmlNodeType.Comment, content, normalizedProps)
            )
          )
        }

        i = endIndex
      } else if (normalizedXml.substr(i + 1, 8) === '!DOCTYPE') {
        let endIndex = findEndIndexOrThrow(normalizedXml, '>', i, `Document Type ${tagNotClosed}`)
        let content = normalizedXml.substring(i + 9, endIndex)

        if (content.includes('[')) {
          endIndex = findEndIndexOrThrow(normalizedXml, ']>', i, `Document Type ${tagNotClosed}`)
          content = normalizedXml.substring(i + 9, endIndex) // include ']'
        }

        if (currentNode) {
          currentNode.addChild(
            new XmlNode(
              XmlNodeType.DocumentType,
              currentNode,
              processNodeValue('', XmlNodeType.DocumentType, content, normalizedProps)
            )
          )
        }

        i = endIndex
      } else if (normalizedXml.substr(i + 1, 8) === '![CDATA[') {
        const endIndex = findEndIndexOrThrow(
          normalizedXml,
          ']]>',
          i,
          `CDATA Section ${tagNotClosed}`
        )
        const content = normalizedXml.substring(i + 9, endIndex - 2)

        if (currentNode && textData) {
          const textValue = toTextValue(
            processNodeValue('', XmlNodeType.Text, textData, normalizedProps)
          )

          if (textValue) {
            currentNode.addChild(new XmlNode(XmlNodeType.Text, currentNode, textValue))
          }
        }

        currentNode.addChild(
          new XmlNode(
            XmlNodeType.CDATA,
            currentNode,
            processNodeValue('', XmlNodeType.CDATA, content, normalizedProps)
          )
        )

        textData = ''
        i = endIndex
      } else {
        let attrBoundary = ''
        let content = ''
        let endIndex = i + 1

        while (endIndex <= xmlLength) {
          let char = normalizedXml[endIndex]

          if (attrBoundary) {
            if (char === attrBoundary) attrBoundary = ''
          } else if (char === '"' || char === "'") {
            attrBoundary = char
          } else if (char === '\t') {
            char = ' '
          } else if (char === '>') {
            break
          }

          content += char
          endIndex++
        }

        if (endIndex > xmlLength) {
          throw new Error(`Element ${tagNotClosed}`)
        }

        content = content.trim()

        const separatorIndex = content.indexOf(' ')

        let tagName = content
        let prefix = ''

        if (~separatorIndex) {
          tagName = content.substr(0, separatorIndex)
          content = content.substr(separatorIndex + 1)
        } else {
          content = ''
        }

        if (!normalizedProps.prefixInName) {
          const prefixIndex = tagName.indexOf(':')

          if (~prefixIndex) {
            prefix = tagName.substring(0, prefixIndex)
            tagName = tagName.substring(prefixIndex + 1)
          }
        }

        if (currentNode && textData) {
          const textValue = toTextValue(
            processNodeValue('', XmlNodeType.Text, textData, normalizedProps)
          )

          if (textValue) {
            currentNode.addChild(new XmlNode(XmlNodeType.Text, currentNode, textValue))
          }
        }

        // self closing tag
        if (content.length && content.lastIndexOf('/') === content.length - 1) {
          if (tagName[tagName.length - 1] === '/') {
            tagName = tagName.substr(0, tagName.length - 1)
            content = ''
          } else {
            content = content.substr(0, content.length - 1)
          }

          const childNode = new XmlNode(XmlNodeType.Element, currentNode)

          childNode.setName(tagName).setPrefix(prefix).setSelfClosing(true)

          if (content && !normalizedProps.ignoreAttributes) {
            childNode.setAttributes(
              parseAttributes(content, XmlNodeType.Element, normalizedProps)
            )
          }

          currentNode.addChild(childNode)
        } else {
          const childNode = new XmlNode(XmlNodeType.Element, currentNode)

          childNode.setName(tagName).setPrefix(prefix)

          if (content && !normalizedProps.ignoreAttributes) {
            childNode.setAttributes(
              parseAttributes(content, XmlNodeType.Element, normalizedProps)
            )
          }

          currentNode.addChild(childNode)
          currentNode = childNode
        }

        textData = ''
        i = endIndex
      }
    }
  }

  return rootXmlNode
}

function findEndIndexOrThrow(value: string, search: string, position: number, error: string) {
  const index = value.indexOf(search, position)

  if (!~index) {
    throw new Error(error)
  }

  return index + search.length - 1
}

function processNodeValue(name: string, type: XmlNodeType, value: string, props: ParseProps) {
  if (value) {
    if (props.trimValues) {
      value = value.trim()
    }

    return parseValue(props.valueProcessor(value, type, name), props.parseNodeValue)
  }

  return null
}

function parseValue(value: TextValue, shouldParse: boolean) {
  if (shouldParse && isString(value)) {
    value = value.trim()

    if (value === 'true') {
      return true
    } else if (value === 'false') {
      return false
    } else {
      return tryToNumber(value)
    }
  } else {
    return isNull(value) ? null : value
  }
}

function tryToNumber(value: string) {
  const number = parseFloat(value)

  return Number.isNaN(number) ? value : number
}

function toTextValue(value: any) {
  return isNull(value) ? '' : isString(value) ? value : String(value)
}

const attributeRE = /[^\s=]+\s*(=\s*['"][\s\S]*?['"])?/g

function parseAttributes(content: string, type: XmlNodeType, props: ParseProps) {
  content = content.replace(/\r?\n/g, ' ')

  const matches = content.match(attributeRE) || []
  const attributes: Record<string, unknown> = {}

  for (let i = 0; i < matches.length; i++) {
    const attrString = matches[i]

    let [name, value] = attrString.split('=') as [string, string?]

    name = name.trim()

    if (isString(value)) {
      value = value.substring(1, value.length - 1)

      if (props.trimValues) {
        value = value.trim()
      }

      attributes[name] = parseValue(
        props.attributeProcessor(value, name, type),
        props.parseNodeValue
      )
    } else {
      attributes[name] = true
    }
  }

  return attributes
}
