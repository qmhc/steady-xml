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
  protected name: string
  protected type: XmlNodeType
  protected parent: XmlNode | null
  protected children: XmlNode[] | null
  protected attributes: Record<string, unknown>
  protected value: any
  protected selfClosing: boolean
  protected prefix: string

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

  getName() {
    return this.name
  }

  setName(value: string) {
    this.name = value
    return this
  }

  getType() {
    return this.type
  }

  setType(value: XmlNodeType) {
    this.type = value
    return this
  }

  getParent() {
    return this.parent
  }

  setParent(value: XmlNode | null) {
    this.parent = value
    return this
  }

  getChildren() {
    return this.children
  }

  setChildren(value: XmlNode[] | null) {
    this.children = value ? Array.from(value) : value
    return this
  }

  getAttributes() {
    return this.attributes
  }

  setAttributes(value: Record<string, unknown>) {
    this.attributes = { ...value }
    return this
  }

  getValue() {
    return this.value
  }

  setValue(value: any) {
    this.value = value
    return this
  }

  getSelfClosing() {
    return this.selfClosing
  }

  setSelfClosing(value: boolean) {
    this.selfClosing = value
    return this
  }

  getPrefix() {
    return this.prefix
  }

  setPrefix(value: string) {
    this.prefix = value
    return this
  }

  getAttribute(name: string) {
    return this.attributes[name]
  }

  setAttribute(name: string, value: unknown) {
    if (isNull(value)) {
      delete this.attributes[name]
    } else {
      this.attributes[name] = value
    }

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
    const type = this.getType()
    const attributes = this.getAttributes()
    const value = this.getValue()
    const children = this.getChildren()

    return {
      type,
      name: this.getName() || undefined,
      prefix: this.getPrefix() || undefined,
      attributes: Object.keys(attributes).length ? attributes : undefined,
      value: isNull(value) ? undefined : value,
      selfClosing: this.getSelfClosing() || undefined,
      children:
        (type === XmlNodeType.Element || type === XmlNodeType.Root) &&
        children &&
        children.length
          ? children.map(child => child.toJSON())
          : undefined
    }
  }

  toXmlString(indentChar = '  ', newLine = '\n', indentCount = 0) {
    const indent = indentChar.repeat(indentCount)
    const attributes = this.getAttributes()
    const name = this.getName()
    const prefix = this.getPrefix()
    const value = this.getValue()
    const selfClosing = this.getSelfClosing()
    const children = this.getChildren()

    let xml = ''

    switch (this.getType()) {
      case XmlNodeType.Root: {
        xml +=
          children && children.length
            ? children
                .map(node => node.toXmlString(indentChar, newLine, indentCount))
                .join(newLine)
            : ''
        break
      }
      case XmlNodeType.Element: {
        if (!name) return ''

        const fullName = prefix ? `${prefix}:${name}` : name

        xml += `${indent}<${fullName}`

        const attributeString = buildAttributeString(attributes || {})

        if (attributeString) {
          xml += ` ${attributeString}`
        }

        if (children && children.length) {
          xml += `>${newLine}${children
            .map(node => node.toXmlString(indentChar, newLine, indentCount + 1))
            .join(newLine)}${newLine}${indent}</${fullName}>`
        } else {
          xml += selfClosing ? ' />' : `></${fullName}>`
        }

        break
      }
      case XmlNodeType.CDATA: {
        xml += `${indent}<![CDATA[${isNull(value) ? '' : value}]]>`
        break
      }
      case XmlNodeType.Text: {
        xml += isNull(value) ? '' : `${indent}${value}`
        break
      }
      case XmlNodeType.DocumentType: {
        xml += isNull(value) ? '' : `${indent}<!DOCTYPE ${value}>`
        break
      }
      case XmlNodeType.Comment: {
        xml += `${indent}<!-- ${isNull(value) ? '' : value + ' '}-->`
        break
      }
      case XmlNodeType.Declaration: {
        xml += `${indent}<?xml `

        if (!attributes || isNull(attributes.version)) {
          xml += 'version="1.0" '
        } else {
          const version = parseFloat(attributes.version as any)

          xml += `version="${Number.isNaN(version) ? '1.0' : version.toFixed(1)}" `
        }

        if (attributes) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { version, ...others } = attributes

          if (Object.keys(others).length) {
            xml += buildAttributeString(others)
          }
        }

        xml += '?>'
        break
      }
      case XmlNodeType.Instruction: {
        xml += isNull(value) ? '' : `${indent}<?${value}?>`
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
