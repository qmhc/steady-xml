# steady-xml

**English** | [中文](./README.zh-CN.md)

A zero-dependence TypeScript library for the steady conversion and processing of XML data.

## Origin

After I convert some XML data to JSON for processing, I expect to intact convert it back to XML data which including interlaced element nodes, CDATA nodes, DOCTYPE nodes, comments and so on.

I looked for some famous XML processing libraries ([fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser), [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)), but most of them consistently chose a compressed conversion to pursue small space and high performance. Although I found a library ([xml-js](https://github.com/nashwaan/xml-js)) that can retain as much information as possible, unfortunately it seems to unmaintained.

This is the origin of this library. The core of this library is to preserve XML information as much as possible during the conversion and processing so that the data can be restored intact. space and performance are not the primary concerns.

## Features

This library using a class `XmlNode` to describe XML nodes and relationships. It can construct `XmlNode` tree from both XML data or JSON, or generate either XML data or JSON from `XmlNode`.

The algorithm of XML data parsing is referred to [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlstr2xmlnode.js) to a certain extent, which is an excellent algorithm that provides a guarantee for the speed of parsing.

Currently can be resolved nodes:

- Element (includes attributes)
- Declaration (includes attributes)
- Comment
- DocumentType
- Text
- ProcessingInstruction
- CDATA

## Install

```sh
yarn add steady-xml
```

## Shorthand

XML to `XmlNode`：

```ts
import { parseXmlString } from 'steady-xml'

const rootNode = parseXmlString('<element></element>')
```

`XmlNode` to XML：

```ts
import { XmlNode, XmlNodeType } from 'steady-xml'

const rootNode = new XmlNode(XmlNodeType.Root)

rootNode.toXmlString()
rootNode.toXmlString('\t', '\n')
rootNode.toXmlString('', '')`${rootNode}`
```

JSON to `XmlNode`：

```ts
import { buildFromJson } from 'steady-xml'

const rootNode = buildFromJson({ name: 'element' })
```

`XmlNode` to JSON：

```ts
import { XmlNode, XmlNodeType } from 'steady-xml'

const rootNode = new XmlNode(XmlNodeType.Root)

rootNode.toJsObject()
JSON.stringify(rootNode)
```

## Props

```ts
type TextValue = string | number | boolean | null

function parseXmlString(xmlString: string, props?: Partial<ParseProps>): XmlNode

interface ParseProps {
  // ignore parse node attributes
  // default: false
  ignoreAttributes: boolean

  // should parse node value
  // default: true
  parseNodeValue: boolean

  // should trim string values
  // default: true
  trimValues: boolean

  // parse node value method
  // default: v => v
  valueProcessor: (value: string, type: XmlNodeType, name: string) => TextValue

  // parse attribute values method
  // default: v => v
  attributeProcessor: (value: string, name: string, type: XmlNodeType) => TextValue
}

function buildFromJson<T extends Record<string, any>>(json: T, props?: Partial<BuildProps>): XmlNode

interface BuildProps {
  // name property key
  // default: 'name'
  nameKey: string

  // type property key
  // default: 'type'
  typeKey: string

  // value property key
  // default: 'value'
  valueKey: string

  // attributes property key
  // default: 'attributes'
  attributesKey: string | false

  // children property key
  // default: 'children'
  childrenKey: string

  // self closing property key
  // default: 'selfClosing'
  selfClosingKey: string | false

  // prefix property key
  // default: 'prefix'
  prefixKey: string | false

  // should trim string values
  // default: true
  trimValues: boolean

  // explicitly specify whether the json is a root node
  // if be specified false, will judge according type
  // if is not a root node, it will as element root node
  // default: false
  isRoot: boolean

  // whether name includes prefix
  // default: false
  prefixInName: boolean

  // parse node value method
  // default: v => v
  valueProcessor: (value: TextValue, type: XmlNodeType, name: string) => TextValue

  // parse attribute values method
  // default: v => v
  attributeProcessor: (value: TextValue, name: string, type: XmlNodeType) => TextValue
}

enum XmlNodeType {
  // is not a real XML node type, only use as the XML data entry
  Root = 'Root',

  // <?xml version="1.0"?>
  Declaration = 'Declaration',

  // <!-- some content -->
  Comment = 'Comment',

  // <!DOCTYPE Items [<!ENTITY number "123">]>
  DocumentType = 'DocumentType',

  // <element></element>
  Element = 'Element',

  // pure text node
  Text = 'Text',

  // <?pi target="target"?>
  Instruction = 'Instruction',

  // <![CDATA[<foo></bar>]]>
  CDATA = 'CDATA'
}

interface XmlJsObject {
  name?: string
  prefix?: string
  type: XmlNodeType
  attributes?: Record<string, unknown>
  value?: any
  selfClosing?: true
  children?: XmlJsObject[]
}

declare class XmlNode {
  // node name
  protected name: string

  // node type
  protected type: XmlNodeType

  // parend node
  protected parent: XmlNode | null

  // chidl node list
  protected children: XmlNode[] | null

  // attribute map
  protected attributes: Record<string, unknown>

  // node value
  protected value: any

  // is self closing
  protected selfClosing: boolean

  // node prefix
  protected prefix: string

  constructor(name: string, type: XmlNodeType, parent?: XmlNode | null, value?: any)

  getName(): string

  // chain set name
  setName(value: string): this

  getType(): XmlNodeType

  // chain set type
  setType(value: XmlNodeType): this

  getParent(): XmlNode | null

  // chain set parent node
  setParent(value: XmlNode | null): this

  getChildren(): XmlNode[] | null

  // chain set children list
  setChildren(value: XmlNode[] | null): this

  getAttributes(): Record<string, unknown>

  // chain set attribute map
  setAttributes(value: Record<string, unknown>): this

  getValue(): any

  // chain set value
  setValue(value: any): this

  getSelfClosing(): boolean

  // chain set self closing
  setSelfClosing(value: boolean): this

  getPrefix(): string

  // chain set prefix
  setPrefix(value: string): this

  // get attribute by name
  getAttribute(name: string): unknown

  // chain add attribute
  // property will be delete when value is null or undefined
  setAttribute(name: string, value: unknown): this

  // chain add child node
  addChild(childNode: XmlNode): void

  // chain remove child node
  removeChild(childNode: XmlNode): this

  // generate json data
  toJsObject(): XmlJsObject

  // generate xml string data
  toXmlString(indentChar?: string, newLine?: string, indentCount?: number): string
}
```

## License

[MIT](./LICENSE) License.
