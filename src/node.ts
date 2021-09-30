import { isNull, isBoolean } from './shared'

export enum XmlNodeType {
  Root = 'Root',
  Declaration = 'Declaration',
  Comment = 'Comment',
  DocumentType = 'DocumentType',
  Element = 'Element',
  Text = 'Text',
  Instruction = 'Instruction',
  CDATA = 'CDATA'
  // Entity = 'Entity',
  // Notation = 'Notation'
}

export interface XmlJsObject {
  name?: string,
  prefix?: string,
  type: XmlNodeType,
  attributes?: Record<string, unknown>,
  value?: any,
  selfClosing?: true,
  children?: XmlJsObject[]
}

export class XmlNode {
  name: string
  type: XmlNodeType
  parent: XmlNode | null
  children: XmlNode[] | null
  attributes: Record<string, unknown>
  value: any
  selfClosing: boolean
  prefix: string

  constructor(type: XmlNodeType, parent: XmlNode | null = null, value: any = null) {
    this.name = ''
    this.type = type
    this.parent = parent
    this.value = value
    this.children = null
    this.attributes = {}
    this.selfClosing = false
    this.prefix = ''
  }

  setName(value: string) {
    this.name = value
    return this
  }

  setType(value: XmlNodeType) {
    this.type = value
    return this
  }

  setParent(value: XmlNode | null) {
    this.parent = value
    return this
  }

  setChildren(value: XmlNode[] | null) {
    this.children = value ? Array.from(value) : value
    return this
  }

  setAttributes(value: Record<string, unknown>) {
    this.attributes = { ...value }
    return this
  }

  setValue(value: any) {
    this.value = value
    return this
  }

  setSelfClosing(value: boolean) {
    this.selfClosing = value
    return this
  }

  setPrefix(value: string) {
    this.prefix = value
    return this
  }

  addAttribute(name: string, value: unknown) {
    this.attributes[name] = value
    return this
  }

  removeAttribute(name: string) {
    delete this.attributes[name]
    return this
  }

  addChild(childNode: XmlNode) {
    if (childNode === this) return this

    if (!this.children) {
      this.children = []
    }

    this.children.push(childNode)

    if (childNode.parent !== this) {
      childNode.parent = this
    }

    return this
  }

  removeChild(childNode: XmlNode) {
    if (this.children && this.children.length) {
      const index = this.children.findIndex(node => node === childNode)

      if (~index) {
        this.children.splice(index, 1)
        childNode.parent = null
      }
    }

    return this
  }

  toJsObject(): XmlJsObject {
    return {
      name: this.name || undefined,
      prefix: this.prefix || undefined,
      type: this.type,
      attributes: Object.keys(this.attributes).length ? this.attributes : undefined,
      value: isNull(this.value) ? undefined : this.value,
      selfClosing: this.selfClosing || undefined,
      children:
        (this.type === XmlNodeType.Element || this.type === XmlNodeType.Root) &&
        this.children &&
        this.children.length
          ? this.children.map(child => child.toJSON())
          : undefined
    }
  }

  toXmlString(indentChar = '  ', newLine = '\n', indentCount = 0) {
    const indent = indentChar.repeat(indentCount)

    let xml = ''

    switch (this.type) {
      case XmlNodeType.Root: {
        xml +=
          this.children && this.children.length
            ? this.children
                .map(node => node.toXmlString(indentChar, newLine, indentCount))
                .join(newLine)
            : ''
        break
      }
      case XmlNodeType.Element: {
        if (!this.name) return ''

        const name = this.prefix ? `${this.prefix}:${this.name}` : this.name

        xml += `${indent}<${name}`

        const attributes = buildAttributeString(this.attributes || {})

        if (attributes) {
          xml += ` ${attributes}`
        }

        if (this.children && this.children.length) {
          xml += `>${newLine}${this.children
            .map(node => node.toXmlString(indentChar, newLine, indentCount + 1))
            .join(newLine)}${newLine}${indent}</${name}>`
        } else {
          xml += this.selfClosing ? ' />' : `></${name}>`
        }

        break
      }
      case XmlNodeType.CDATA: {
        xml += `${indent}<![CDATA[${isNull(this.value) ? '' : this.value}]]>`
        break
      }
      case XmlNodeType.Text: {
        xml += isNull(this.value) ? '' : `${indent}${this.value}`
        break
      }
      case XmlNodeType.DocumentType: {
        xml += isNull(this.value) ? '' : `${indent}<!DOCTYPE ${this.value}>`
        break
      }
      case XmlNodeType.Comment: {
        xml += `${indent}<!-- ${isNull(this.value) ? '' : this.value + ' '}-->`
        break
      }
      case XmlNodeType.Declaration: {
        xml += `${indent}<?xml `

        if (!this.attributes || isNull(this.attributes.version)) {
          xml += 'version="1.0" '
        } else {
          const version = parseFloat(this.attributes.version as any)

          xml += `version="${Number.isNaN(version) ? '1.0' : version.toFixed(1)}" `
        }

        if (this.attributes) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { version, ...attributes } = this.attributes

          if (attributes) {
            xml += buildAttributeString(attributes)
          }
        }

        xml += '?>'
        break
      }
      case XmlNodeType.Instruction: {
        xml += isNull(this.value) ? '' : `${indent}<?${this.value}?>`
        break
      }
    }

    return xml
  }

  toJSON() {
    return this.toJsObject()
  }

  toString() {
    return this.toXmlString('', '')
  }
}

function buildAttributeString(attributes: Record<string, unknown>) {
  return Object.keys(attributes)
    .map(key => {
      const value = attributes[key] as any

      if (isNull(value)) {
        return null
      }

      if (isBoolean(value)) {
        return value ? key : null
      }

      return `${key}="${value}"`
    })
    .filter(Boolean)
    .join(' ')
}
