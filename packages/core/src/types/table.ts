import { IFormProps } from '@formily/core'
import { Stringify } from '@formily/json-schema'

export interface Option {
  label: string
  value: any
}

export type Options = Option[]
export interface Column<T = any> {
  title: any
  key: string
  visible?: boolean
  type?:
    | 'text'
    | 'link'
    | 'enum'
    | 'date'
    | 'datetime'
    | 'currency'
    | 'percent'
    | 'money'
    | 'image'
    | 'html'
    | 'json'
    | 'boolean'
    | (string & {})
  enums?: Options | Record<string, any> | ((text: any, record: T, index: number) => any) | string
  color?: Options | Record<string, any> | ((text: any, record: T, index: number) => any) | string
  render?: (text: any, record: T, index: number) => any | string
  [key: string]: any
}

export type Columns<T = any> = Column<T>[]

export type StringifyColumns<T = any> = Stringify<Columns<T>>

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
  type: 'edit' | 'delete' | (string & {})
  text: string
  onClick?: (record: T, index: number) => void
  render?: (record: T, index: number) => any
  loading?: boolean
  auth?: boolean | ((record: T) => boolean)
  props?: Record<string, any>
  [key: string]: any
}

export type Actions<T> = Action<T>[]

export type Auth<Row> = boolean | ((record: Row) => boolean)

export type AuthMap<Row> = Record<'add' | 'edit' | 'del' | (string & {}), Auth<Row>>

export interface FormProps<
  SearchParams extends object = any,
  AddParams extends object = any,
  EditParams extends object = any
> {
  search: IFormProps<SearchParams>
  add: IFormProps<AddParams>
  edit: IFormProps<EditParams>
}

export type OnSearchFn<Params = any, Row = any> = (
  params: Params,
  pagination: Pagination
) => Promise<SearchResult<Row> | false | undefined>

export type ActionFn<Params = any> = (params: Params) => Promise<boolean | undefined>
