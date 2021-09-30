import { XmlNodeType, XmlNode } from '../src/node'
import { parseXmlString } from '../src/parser'
import { buildFromJson } from '../src/builder'

describe('node tests', () => {
  it('can construct', () => {
    const node = new XmlNode(XmlNodeType.Element).setName('test-node')

    expect(node.name).toBe('test-node')
    expect(node.type).toBe(XmlNodeType.Element)
  })

  it('has parent', () => {
    const parent = new XmlNode(XmlNodeType.Root)
    const node = new XmlNode(XmlNodeType.Element, parent).setName('test-node')

    expect(node.parent).toBe(parent)
  })

  it('has value', () => {
    const node = new XmlNode(XmlNodeType.Element, null, 'test-value').setName('test-node')

    expect(node.value).toBe('test-value')
  })

  it('toJsObject method', () => {
    const root = new XmlNode(XmlNodeType.Root)
    const node = new XmlNode(XmlNodeType.Element, root).setName('test-node')

    node.attributes = { name: 'element', active: true }

    root.addChild(new XmlNode(XmlNodeType.Comment, root, 'A Comment'))
    root.addChild(node)

    expect(root.toJsObject()).toEqual({
      name: undefined,
      prefix: undefined,
      type: XmlNodeType.Root,
      attributes: undefined,
      value: undefined,
      selfClosing: undefined,
      children: [
        {
          name: undefined,
          prefix: undefined,
          type: XmlNodeType.Comment,
          attributes: undefined,
          value: 'A Comment',
          selfClosing: undefined,
          children: undefined
        },
        {
          name: 'test-node',
          prefix: undefined,
          type: XmlNodeType.Element,
          attributes: { name: 'element', active: true },
          value: undefined,
          selfClosing: undefined,
          children: undefined
        }
      ]
    })
  })

  it('toXmlString method', () => {
    const root = new XmlNode(XmlNodeType.Root)
    const node = new XmlNode(XmlNodeType.Element, root).setName('test-node')

    node.attributes = { name: 'element', active: true }

    root.addChild(new XmlNode(XmlNodeType.Comment, root, 'A Comment')).addChild(node)

    expect(root.toXmlString()).toBe(
      `<!-- A Comment -->
<test-node name="element" active></test-node>`
    )
  })

  it('steadily transfrom', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<!DOCTYPE Items [<!ENTITY number "123">]>
<document>
  <![CDATA[<foo></bar>]]>
  <head lang="en">
    <title>
      Some
      <![CDATA[<456>]]>
      Content.
    </title>
  </head>
  <!-- A Comment -->
  <?pi-test target="target"?>
  <body>
    <script src="./src/parser.js" module></script>
    <div>
      Hello, World!
    </div>
    <input type="button" />
    <style></style>
    <div class="message">
      Some Messages.
    </div>
    <script src="./index.js"></script>
  </body>
</document>`

    const root = parseXmlString(xmlString)
    const json = root.toJsObject()
    const node = buildFromJson(json)
    const xml = node.toXmlString()

    expect(xml).toBe(xmlString)
  })
})
