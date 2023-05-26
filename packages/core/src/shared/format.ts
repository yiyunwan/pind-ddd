import dayjs from 'dayjs'
import { Column } from '../types'

export function formatDate(value: any) {
  return dayjs(value).format('YYYY-MM-DD')
}

export function formatDateTime(value: any) {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

export function formatTime(value: any) {
  return dayjs(value).format('HH:mm:ss')
}

export function formatMoney(value: any) {
  return `￥${value}`
}

export function formatPercent(value: any) {
  return `${value}%`
}

export function formatNumber(value: any) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatBoolean(value: any) {
  return value ? '是' : '否'
}

export function formatEnum(value: any, record: any, index: number, column: Column<any>) {
  const { enums } = column
  if (!enums) return value
  if (Array.isArray(enums)) return enums.find((item) => item.value === value)?.label || value
  if (typeof enums === 'function') return enums(value, record, index, column)
  if (typeof enums === 'object') return enums[value] || value
  return value
}
