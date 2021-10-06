import { buildFromJson } from '../src/builder'
import { XmlNodeType, XmlNode } from '../src/node'

describe('builder tests', () => {
  it('return root node', () => {
    expect(buildFromJson({})).toBeInstanceOf(XmlNode)
    expect(buildFromJson({}).getType()).toBe(XmlNodeType.Root)
    expect(buildFromJson({ type: XmlNodeType.Root }).getType()).toBe(XmlNodeType.Root)
    expect(buildFromJson({}, { isRoot: true }).getType()).toBe(XmlNodeType.Root)
  })

  it('add declaration node', () => {
    const root = buildFromJson({})
    const node = root.getChildren()![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Declaration)
    expect(node.getAttributes()).toEqual({ version: 1, encoding: 'UTF-8', standalone: 'yes' })
    expect(node.getParent()).toBe(root)
  })

  it('build declaration node', () => {
    const root = buildFromJson({
      type: XmlNodeType.Root,
      children: [
        { type: XmlNodeType.Declaration },
        { type: XmlNodeType.Declaration, attributes: { version: '1.0' } }
      ]
    })
    const node1 = root.getChildren()![0]
    const node2 = root.getChildren()![1]

    expect(node1).toBeInstanceOf(XmlNode)
    expect(node1.getType()).toBe(XmlNodeType.Declaration)
    expect(node1.getName()).toBe('')
    expect(node1.getValue()).toBe(null)
    expect(node1.getAttributes()).toEqual({ version: 1 })
    expect(node1.getParent()).toBe(root)

    expect(node2).toBeInstanceOf(XmlNode)
    expect(node2.getType()).toBe(XmlNodeType.Declaration)
    expect(node2.getName()).toBe('')
    expect(node2.getValue()).toBe(null)
    expect(node2.getAttributes()).toEqual({ version: 1 })
    expect(node2.getParent()).toBe(root)
  })

  it('build element node', () => {
    const root = buildFromJson({ name: 'element', attributes: { name: 'node', active: true } })
    const node = root.getChildren()![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Element)
    expect(node.getName()).toBe('element')
    expect(node.getAttributes()).toEqual({ name: 'node', active: true })
    expect(node.getParent()).toBe(root)
  })

  it('build cdata node', () => {
    const root = buildFromJson({ type: XmlNodeType.CDATA, value: '<foo></bar>' })
    const node = root.getChildren()![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.CDATA)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('<foo></bar>')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
  })

  it('build text node', () => {
    const root = buildFromJson({
      type: XmlNodeType.Root,
      children: ['text1', { type: XmlNodeType.Text, value: 'text2' }]
    })
    const text1 = root.getChildren()![0]
    const text2 = root.getChildren()![1]

    expect(text1).toBeInstanceOf(XmlNode)
    expect(text1.getType()).toBe(XmlNodeType.Text)
    expect(text1.getName()).toBe('')
    expect(text1.getValue()).toBe('text1')
    expect(text1.getAttributes()).toEqual({})
    expect(text1.getParent()).toBe(root)

    expect(text2).toBeInstanceOf(XmlNode)
    expect(text2.getType()).toBe(XmlNodeType.Text)
    expect(text2.getName()).toBe('')
    expect(text2.getValue()).toBe('text2')
    expect(text2.getAttributes()).toEqual({})
    expect(text2.getParent()).toBe(root)
  })

  it('build document type node', () => {
    const root = buildFromJson({
      type: XmlNodeType.DocumentType,
      value: 'Items [<!ENTITY number "123">]'
    })
    const node = root.getChildren()![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.DocumentType)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('Items [<!ENTITY number "123">]')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
  })

  it('build comment node', () => {
    const root = buildFromJson({ type: XmlNodeType.Comment, value: 'a comment' })
    const node = root.getChildren()![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Comment)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('a comment')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
  })

  it('build instruction node', () => {
    const root = buildFromJson({ type: XmlNodeType.Instruction, value: 'pi target="target"' })
    const node = root.getChildren()![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.getType()).toBe(XmlNodeType.Instruction)
    expect(node.getName()).toBe('')
    expect(node.getValue()).toBe('pi target="target"')
    expect(node.getAttributes()).toEqual({})
    expect(node.getParent()).toBe(root)
  })
})
