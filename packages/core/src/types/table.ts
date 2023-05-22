export interface Column<T = any> {
  title: any
  dataIndex: string
  render?: (text: any, record: T, index: number) => any | string
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

export interface Action<T> {
  type: string
  text: string
  onClick?: (record: T, index: number) => void
  render?: (record: T, index: number) => any
  loading?: boolean
  auth?: boolean | ((record: T) => boolean)
  [key: string]: any
}

export type Actions<T> = Action<T>[]

export type Auth<Row> = boolean | ((record: Row) => boolean)

export type AuthMap<Row> = Record<'add' | 'edit' | 'del' | (string & {}), Auth<Row>>
