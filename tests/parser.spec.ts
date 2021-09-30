import { parseXmlString } from '../src/parser'
import { XmlNodeType, XmlNode } from '../src/node'

describe('parser tests', () => {
  it('return root node', () => {
    expect(parseXmlString('')).toBeInstanceOf(XmlNode)
    expect(parseXmlString('').type).toBe(XmlNodeType.Root)
  })

  it('parse element node', () => {
    const root = parseXmlString('<element name="node" active></element>')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Element)
    expect(node.name).toBe('element')
    expect(node.attributes).toEqual({ name: 'node', active: true })
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<element name="node"')).toThrowError()
  })

  it('parse comment node', () => {
    const root = parseXmlString('<!-- A Comment -->')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Comment)
    expect(node.name).toBe('')
    expect(node.value).toBe('A Comment')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<!-- A Comment --')).toThrowError()
  })

  it('parse instruction node', () => {
    const root = parseXmlString('<?pi target="target"?>')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Instruction)
    expect(node.name).toBe('')
    expect(node.value).toBe('pi target="target"')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<?pi target="target"?')).toThrowError()
  })

  it('parse declaration node', () => {
    const root = parseXmlString('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Declaration)
    expect(node.name).toBe('')
    expect(node.value).toBeNull()
    expect(node.attributes).toEqual({ version: 1, encoding: 'UTF-8', standalone: 'yes' })
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<?xml version="1.0"?')).toThrowError()
  })

  it('parse document type node', () => {
    const root = parseXmlString('<!DOCTYPE Items [<!ENTITY number "123">]>')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.DocumentType)
    expect(node.name).toBe('')
    expect(node.value).toBe('Items [<!ENTITY number "123">]')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<!DOCTYPE Items [<!ENTITY number "123">]')).toThrowError()
  })

  it('parse cdata node', () => {
    const root = parseXmlString('<![CDATA[<foo></bar>]]>')
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.CDATA)
    expect(node.name).toBe('')
    expect(node.value).toBe('<foo></bar>')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
    expect(() => parseXmlString('<![CDATA[<foo></bar>]]')).toThrowError()
  })
})
