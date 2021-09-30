import { buildFromJson } from '../src/builder'
import { XmlNodeType, XmlNode } from '../src/node'

describe('builder tests', () => {
  it('return root node', () => {
    expect(buildFromJson({})).toBeInstanceOf(XmlNode)
    expect(buildFromJson({}).type).toBe(XmlNodeType.Root)
    expect(buildFromJson({ type: XmlNodeType.Root }).type).toBe(XmlNodeType.Root)
    expect(buildFromJson({}, { isRoot: true }).type).toBe(XmlNodeType.Root)
  })

  it('add declaration node', () => {
    const root = buildFromJson({})
    const node = root.children![0]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Declaration)
    expect(node.attributes).toEqual({ version: 1, encoding: 'UTF-8', standalone: 'yes' })
    expect(node.parent).toBe(root)
  })

  it('build declaration node', () => {
    const root = buildFromJson({
      type: XmlNodeType.Root,
      children: [
        { type: XmlNodeType.Declaration },
        { type: XmlNodeType.Declaration, attributes: { version: '1.0' } }
      ]
    })
    const node1 = root.children![0]
    const node2 = root.children![1]

    expect(node1).toBeInstanceOf(XmlNode)
    expect(node1.type).toBe(XmlNodeType.Declaration)
    expect(node1.name).toBe('')
    expect(node1.value).toBe(null)
    expect(node1.attributes).toEqual({ version: 1 })
    expect(node1.parent).toBe(root)

    expect(node2).toBeInstanceOf(XmlNode)
    expect(node2.type).toBe(XmlNodeType.Declaration)
    expect(node2.name).toBe('')
    expect(node2.value).toBe(null)
    expect(node2.attributes).toEqual({ version: 1 })
    expect(node2.parent).toBe(root)
  })

  it('build element node', () => {
    const root = buildFromJson({ name: 'element', attributes: { name: 'node', active: true } })
    const node = root.children![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Element)
    expect(node.name).toBe('element')
    expect(node.attributes).toEqual({ name: 'node', active: true })
    expect(node.parent).toBe(root)
  })

  it('build cdata node', () => {
    const root = buildFromJson({ type: XmlNodeType.CDATA, value: '<foo></bar>' })
    const node = root.children![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.CDATA)
    expect(node.name).toBe('')
    expect(node.value).toBe('<foo></bar>')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
  })

  it('build text node', () => {
    const root = buildFromJson({
      type: XmlNodeType.Root,
      children: ['text1', { type: XmlNodeType.Text, value: 'text2' }]
    })
    const text1 = root.children![0]
    const text2 = root.children![1]

    expect(text1).toBeInstanceOf(XmlNode)
    expect(text1.type).toBe(XmlNodeType.Text)
    expect(text1.name).toBe('')
    expect(text1.value).toBe('text1')
    expect(text1.attributes).toEqual({})
    expect(text1.parent).toBe(root)

    expect(text2).toBeInstanceOf(XmlNode)
    expect(text2.type).toBe(XmlNodeType.Text)
    expect(text2.name).toBe('')
    expect(text2.value).toBe('text2')
    expect(text2.attributes).toEqual({})
    expect(text2.parent).toBe(root)
  })

  it('build document type node', () => {
    const root = buildFromJson({
      type: XmlNodeType.DocumentType,
      value: 'Items [<!ENTITY number "123">]'
    })
    const node = root.children![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.DocumentType)
    expect(node.name).toBe('')
    expect(node.value).toBe('Items [<!ENTITY number "123">]')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
  })

  it('build comment node', () => {
    const root = buildFromJson({ type: XmlNodeType.Comment, value: 'a comment' })
    const node = root.children![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Comment)
    expect(node.name).toBe('')
    expect(node.value).toBe('a comment')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
  })

  it('build instruction node', () => {
    const root = buildFromJson({ type: XmlNodeType.Instruction, value: 'pi target="target"' })
    const node = root.children![1]

    expect(node).toBeInstanceOf(XmlNode)
    expect(node.type).toBe(XmlNodeType.Instruction)
    expect(node.name).toBe('')
    expect(node.value).toBe('pi target="target"')
    expect(node.attributes).toEqual({})
    expect(node.parent).toBe(root)
  })
})
