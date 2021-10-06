import { parseXmlString } from '../src/parser'
import { XmlNodeType, XmlNode } from '../src/node'

describe('parser tests', () => {
  it('return root node', () => {
    expect(parseXmlString('')).toBeInstanceOf(XmlNode)
    expect(parseXmlString('').getType()).toBe(XmlNodeType.Root)
  })

  it('parse element node', () => {
    const root = parseXmlString('<element name="node" active></element>')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Element)
    expect(node.getName()).toBe('element')
    expect(node.getAttributes()).toEqual({ name: 'node', active: true })
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<element name="node"')).toThrowError()
  })

  it('parse comment node', () => {
    const root = parseXmlString('<!-- A Comment -->')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Comment)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('A Comment')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<!-- A Comment --')).toThrowError()
  })

  it('parse instruction node', () => {
    const root = parseXmlString('<?pi target="target"?>')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Instruction)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('pi target="target"')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<?pi target="target"?')).toThrowError()
  })

  it('parse declaration node', () => {
    const root = parseXmlString('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Declaration)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBeNull()
    expect(node.getAttributes()).toEqual({ version: 1, encoding: 'UTF-8', standalone: 'yes' })
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<?xml version="1.0"?')).toThrowError()
  })

  it('parse document type node', () => {
    const root = parseXmlString('<!DOCTYPE Items [<!ENTITY number "123">]>')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.DocumentType)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('Items [<!ENTITY number "123">]')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<!DOCTYPE Items [<!ENTITY number "123">]')).toThrowError()
  })

  it('parse cdata node', () => {
    const root = parseXmlString('<![CDATA[<foo></bar>]]>')
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.CDATA)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('<foo></bar>')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
    expect(() => parseXmlString('<![CDATA[<foo></bar>]]')).toThrowError()
  })
})
