import { isNull } from './shared'

import type { XmlNodeType } from './node'

export type TextValue = string | number | boolean | null

export interface ParseProps {
  ignoreAttributes: boolean,
  parseNodeValue: boolean,
  trimValues: boolean,
  prefixInName: boolean,
  valueProcessor: (value: string, type: XmlNodeType, name: string) => TextValue,
  attributeProcessor: (value: string, name: string, type: XmlNodeType) => TextValue
}

export interface BuildProps {
  nameKey: string,
  typeKey: string,
  valueKey: string,
  attributesKey: string | false,
  childrenKey: string,
  selfClosingKey: string | false,
  prefixKey: string | false,
  trimValues: boolean,
  isRoot: boolean,
  prefixInName: boolean,
  valueProcessor: (value: TextValue, type: XmlNodeType, name: string) => TextValue,
  attributeProcessor: (value: TextValue, name: string, type: XmlNodeType) => TextValue
}

const defaultProcessor = (v: any) => v

export const defaultParseProps: ParseProps = {
  ignoreAttributes: false,
  parseNodeValue: true,
  trimValues: true,
  prefixInName: false,
  valueProcessor: defaultProcessor,
  attributeProcessor: defaultProcessor
}

export const defaultBuildProps: BuildProps = {
  nameKey: 'name',
  typeKey: 'type',
  valueKey: 'value',
  attributesKey: 'attributes',
  childrenKey: 'children',
  selfClosingKey: 'selfClosing',
  prefixKey: 'prefix',
  trimValues: true,
  isRoot: false,
  prefixInName: false,
  valueProcessor: defaultProcessor,
  attributeProcessor: defaultProcessor
}

const parsePropKeys = Object.keys(defaultParseProps) as Array<keyof ParseProps>

export function normalizeParseProps(props: Partial<ParseProps> = {}): ParseProps {
  const normalizedProps = { ...props } as any

  parsePropKeys.forEach(key => {
    if (isNull(normalizedProps[key])) {
      normalizedProps[key] = defaultParseProps[key]
    }
  })

  return normalizedProps
}

const buildPropKeys = Object.keys(defaultBuildProps) as Array<keyof BuildProps>

export function normalizeBuildProps(props: Partial<BuildProps> = {}): BuildProps {
  const normalizedProps = { ...props } as any

  buildPropKeys.forEach(key => {
    if (isNull(normalizedProps[key])) {
      normalizedProps[key] = defaultBuildProps[key]
    }
  })

  return normalizedProps
}
