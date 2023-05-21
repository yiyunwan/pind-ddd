import type { TableModel } from '../models'

export interface Column<T = any> {
  title: any
  dataIndex: string
  render?: (text: any, record: T, index: number, table: TableModel) => any | string
  [key: string]: any
}

export type Columns<T = any> = Column<T>[]

export interface SearchResult<T = any> {
  list: T[]
  pagination: Pagination
}

export interface Pagination {
  total: number
  page: number
  pageSize: number
}
