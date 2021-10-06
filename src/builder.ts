import { isArray, isNull, isObject, isString } from './shared'
import { XmlNodeType, XmlNode } from './node'
import { normalizeBuildProps } from './props'

import type { TextValue, BuildProps } from './props'

interface LoopItem<T> {
  parent: XmlNode,
  child: string | T
}

export function buildFromJson<T extends Record<string, any>>(
  json: T,
  props: Partial<BuildProps> = {}
) {
  const normalizedProps = normalizeBuildProps(props)
  const { nameKey, typeKey, valueKey, attributesKey, childrenKey, selfClosingKey, prefixKey } =
    normalizedProps

  const rootXmlNode = new XmlNode(XmlNodeType.Root)

  const loopQueue: LoopItem<T>[] = []

  if (normalizedProps.isRoot || json[typeKey] === XmlNodeType.Root) {
    loopQueue.push(
      ...((json[childrenKey] as T[]) || []).map(child => ({ parent: rootXmlNode, child }))
    )
  } else {
    const declarationNdoe = new XmlNode(XmlNodeType.Declaration, rootXmlNode)

    declarationNdoe.setAttributes({
      version: 1,
      encoding: 'UTF-8',
      standalone: 'yes'
    })

    rootXmlNode.addChild(declarationNdoe)
    loopQueue.push({ parent: rootXmlNode, child: json })
  }

  while (loopQueue.length) {
    const { parent, child } = loopQueue.shift()!

    if (isString(child)) {
      parent.addChild(
        new XmlNode(
          XmlNodeType.Text,
          parent,
          processNodeValue(XmlNodeType.Text, child, '', normalizedProps)
        )
      )
      continue
    }

    const name = isString(child[nameKey]) ? (child[nameKey] as string) : ''
    const type = child[typeKey]
    const value = isNull(child[valueKey]) ? null : child[valueKey]

    switch (type) {
      case XmlNodeType.CDATA: {
        parent.addChild(
          new XmlNode(XmlNodeType.CDATA, parent, processNodeValue(type, value, '', normalizedProps))
        )
        break
      }
      case XmlNodeType.Text: {
        parent.addChild(
          new XmlNode(XmlNodeType.Text, parent, processNodeValue(type, value, '', normalizedProps))
        )
        break
      }
      case XmlNodeType.DocumentType: {
        parent.addChild(
          new XmlNode(
            XmlNodeType.DocumentType,
            parent,
            processNodeValue(type, value, '', normalizedProps)
          )
        )
        break
      }
      case XmlNodeType.Comment: {
        parent.addChild(
          new XmlNode(
            XmlNodeType.Comment,
            parent,
            processNodeValue(type, value, '', normalizedProps)
          )
        )
        break
      }
      case XmlNodeType.Declaration: {
        const node = new XmlNode(XmlNodeType.Declaration, parent)
        const attributes = attributesKey && child[attributesKey]

        if (attributes && isObject(attributes)) {
          Object.keys(attributes).forEach(key => {
            node.setAttribute(
              key,
              normalizedProps.attributeProcessor(attributes[key], key, XmlNodeType.Declaration)
            )
          })
        }

        if (!node.getAttribute('version')) {
          node.setAttribute('version', 1)
        } else {
          const version = parseFloat(node.getAttribute('version') as any)

          node.setAttribute('version', Number.isNaN(version) ? 1 : version)
        }

        parent.addChild(node)
        break
      }
      case XmlNodeType.Instruction: {
        parent.addChild(
          new XmlNode(
            XmlNodeType.Instruction,
            parent,
            processNodeValue(type, value, '', normalizedProps)
          )
        )
        break
      }
      // default build as element node
      default: {
        if (!name) break

        let tagName = name
        let prefix = ''

        if (normalizedProps.prefixInName) {
          const prefixIndex = tagName.indexOf(':')

          if (~prefixIndex) {
            prefix = tagName.substring(0, prefixIndex)
            tagName = tagName.substring(prefixIndex + 1)
          }
        } else if (prefixKey && isString(child[prefixKey])) {
          prefix = child[prefixKey]
        }

        const node = new XmlNode(XmlNodeType.Element, parent)
        const attributes = attributesKey && child[attributesKey]

        node.setName(tagName).setPrefix(prefix)

        if (attributes && isObject(attributes)) {
          Object.keys(attributes).forEach(key => {
            node.setAttribute(
              key,
              normalizedProps.attributeProcessor(attributes[key], key, XmlNodeType.Element)
            )
          })
        }

        parent.addChild(node)

        const children = child[childrenKey]

        if (isArray(children) && children.length) {
          node.setSelfClosing(false)

          loopQueue.push(...children.map(child => ({ parent: node, child })))
        } else {
          node.setSelfClosing(Boolean(selfClosingKey && child[selfClosingKey]))
        }
      }
    }
  }

  return rootXmlNode
}

function processNodeValue(type: XmlNodeType, value: TextValue, name: string, props: BuildProps) {
  value = props.valueProcessor(value, type, name)

  if (isNull(value)) {
    return null
  }

  if (isString(value)) {
    return props.trimValues ? value.trim() : value
  }

  return String(value)
}
