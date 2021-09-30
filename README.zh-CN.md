# steady-xml

**中文** | [English](./README.md)

一个用于稳重地转换与处理 XML 数据的零依赖 TypeScript 库。

## 初衷

我在将一些 XML 数据转为 JSON 进行处理后，希望其能完好无缺地转回 XML 数据，包括交错的子节点、CDATA、DOCTYPE、注释等。

我寻找了一些有名的 XML 处理库 ([fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)、[node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js))，但它们无一不选择了一种压缩转换的方式，以追求小空间和高性能；尽管我还找到一个能保留尽可能多数据信息的处理库 ([xml-js](https://github.com/nashwaan/xml-js))，但很遗憾其在数据相互转换依然存在一些问题以及似乎没有人维护了。

这便是这个库的由来，其核心是在转换过程中尽可能的保留 XML 的信息，以便能够完好地复原数据，空间和性能并不是首要关注点。

## 特性

这个库采用一个类 `XmlNode` 来描述 XML 数据中的节点和关系，可以同时由 XML 数据或者 JSON 数据构造 `XmlNode` 树，或者由 `XmlNode` 生成 XML 数据或 JSON 数据。

对 XML 数据解析的算法一定程度参考了 [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/src/xmlstr2xmlnode.js)，这是一个优秀的算法，为解析速度提供了保障。

目前可以解析的节点：

- Element (包含属性)
- Declaration (包含属性)
- Comment
- DocumentType
- Text
- ProcessingInstruction
- CDATA

## 安装

```sh
yarn add steady-xml
```

## 速记

XML 转为 `XmlNode`：

```ts
import { parseXmlString } from 'steady-xml'

const rootNode = parseXmlString('<element></element>')
```

`XmlNode` 转为 XML：

```ts
import { XmlNode, XmlNodeType } from 'steady-xml'

const rootNode = new XmlNode(XmlNodeType.Root)

rootNode.toXmlString()
rootNode.toXmlString('\t', '\n')
rootNode.toXmlString('', '')`${rootNode}`
```

JSON 转为 `XmlNode`：

```ts
import { buildFromJson } from 'steady-xml'

const rootNode = buildFromJson({ name: 'element' })
```

`XmlNode` 转为 JSON：

```ts
import { XmlNode, XmlNodeType } from 'steady-xml'

const rootNode = new XmlNode(XmlNodeType.Root)

rootNode.toJsObject()
JSON.stringify(rootNode)
```

## 属性

```ts
type TextValue = string | number | boolean | null

function parseXmlString(xmlString: string, props?: Partial<ParseProps>): XmlNode

interface ParseProps {
  // 是否忽略属性解析
  // 默认值: false
  ignoreAttributes: boolean

  // 是否进行节点值解析
  // 默认值: true
  parseNodeValue: boolean

  // 是否抹除字符值两边的空格
  // 默认值: true
  trimValues: boolean

  // 节点值解析方法
  // 默认值: v => v
  valueProcessor: (value: string, type: XmlNodeType, name: string) => TextValue

  // 属性值解析方法
  // 默认值: v => v
  attributeProcessor: (value: string, name: string, type: XmlNodeType) => TextValue
}

function buildFromJson<T extends Record<string, any>>(json: T, props?: Partial<BuildProps>): XmlNode

interface BuildProps {
  // 节点名称的键值
  // 默认值: 'name'
  nameKey: string

  // 节点类型的键值
  // 默认值: 'type'
  typeKey: string

  // 节点值的键值
  // 默认值: 'value'
  valueKey: string

  // 节点属性的键值
  // 默认值: 'attributes'
  attributesKey: string | false

  // 节点子子节点的键值
  // 默认值: 'children'
  childrenKey: string

  // 节点自关闭的键值
  // 默认值: 'selfClosing'
  selfClosingKey: string | false

  // 节点前缀的键值
  // 默认值: 'prefix'
  prefixKey: string | false

  // 是否抹除字符值两边的空格
  // 默认值: true
  trimValues: boolean

  // 显式地指定传入的数据是否为根节点
  // 若为 false 时会根据 type 来判断是否为根节点
  // 若第一个 json 不为根节点，则会被作为根 element 节点
  // 默认值: false
  isRoot: boolean

  // 设置前缀是否包含在名称中
  // 默认值: false
  prefixInName: boolean

  // 节点值解析方法
  // 默认值: v => v
  valueProcessor: (value: TextValue, type: XmlNodeType, name: string) => TextValue

  // 属性值解析方法
  // 默认值: v => v
  attributeProcessor: (value: TextValue, name: string, type: XmlNodeType) => TextValue
}

enum XmlNodeType {
  // 该类型并不是真实的 XML 类型，仅用来作为 XML 数据入口
  Root = 'Root'

  // <?xml version="1.0"?>
  Declaration = 'Declaration'

  // <!-- some content -->
  Comment = 'Comment'

  // <!DOCTYPE Items [<!ENTITY number "123">]>
  DocumentType = 'DocumentType'

  // <element></element>
  Element = 'Element'

  // 纯文本节点
  Text = 'Text'

  // <?pi target="target"?>
  Instruction = 'Instruction'

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

class XmlNode {
  // 节点的名称
  name: string

  // 节点的类型
  type: XmlNodeType

  // 父节点
  parent: XmlNode | null

  // 子节点
  children: XmlNode[] | null

  // 节点的属性
  attributes: Record<string, unknown>

  // 节点值
  value: any

  // 是否自关闭
  selfClosing: boolean

  // 节点前缀
  prefix: string

  // 构造方法
  constructor(name: string, type: XmlNodeType, parent?: XmlNode | null, value?: any);

  // 链式设置名称
  setName(value: string): this

  // 链式设置类型
  setType(value: XmlNodeType): this

  // 链式设置父节点
  setParent(value: XmlNode | null): this

  // 链式设置子节点
  setChildren(value: XmlNode[] | null): this

  // 链式设置属性
  setAttributes(value: Record<string, unknown>): this

  // 链式设置值
  setValue(value: any): this

  // 链式设置是否自关闭
  setSelfClosing(value: boolean): this

  // 链式设置前缀
  setPrefix(value: string): this

  // 链式添加属性
  addAttribute(name: string, value: unknown): this

  // 链式移除属性
  removeAttribute(name: string): this

  // 链式添加子节点
  addChild(childNode: XmlNode): void

  // 链式移除子节点
  removeChild(childNode: XmlNode): this

  // 生成 JSON 对象
  toJsObject(): XmlJsObject

  // 生成 XML 数据
  toXmlString(indentChar?: string, newLine?: string, indentCount?: number): string
}
```

## 授权

[MIT](./LICENSE) 授权。
