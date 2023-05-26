import { Column, FormatFn } from '@pind/ddd-core'
import { Image } from 'ant-design-vue'

export function formatColor(row: Record<string, any>, index: number, column: Column) {
  const { color, key } = column
  const value = row[key]
  if (!color) return ''
  if (Array.isArray(color)) {
    const item = color.find((item) => item.value === value)
    if (item) return item.color || item.value
  } else if (typeof color === 'function') {
    return color(value, row, index, column)
  } else if (typeof color === 'object') {
    return color[value]
  } else if (typeof color === 'string') {
    return color
  }
}

export const formatLink: FormatFn = (value: any) => {
  return (
    <a href={value} target="_blank">
      {value}
    </a>
  )
}

export const formatImage: FormatFn = (value: any) => {
  return (
    <Image src={value} style={{ width: '100px', height: '100px', objectFit: 'contain' }} preview />
  )
}

export const formatHtml: FormatFn = (value: any) => {
  return <div innerHTML={value}></div>
}

export const formatJson: FormatFn = (value: any) => {
  return <pre>{JSON.stringify(value, null, 2)}</pre>
}
