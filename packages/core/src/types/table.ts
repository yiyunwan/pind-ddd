import { IFormProps } from '@formily/core'
import { Stringify } from '@formily/json-schema'

export interface Option {
  label: string
  value: any
}

export type Options = Option[]

export type FormatType =
  | 'date'
  | 'datetime'
  | 'time'
  | 'money'
  | 'percent'
  | 'number'
  | 'boolean'
  | 'enum'
  | (string & {})

export type ColumnFn<T = any> = (text: any, record: T, index: number, column: Column<T>) => any

export interface Column<T = any> {
  title: any
  key: string
  visible?: boolean
  type?: FormatType
  /**
   * 当传入enums时，type 若未设置则默认为enum
   */
  enums?: Options | Record<string, any> | ColumnFn<T> | string
  color?: Options | Record<string, any> | ColumnFn<T> | string
  render?: ColumnFn<T> | string
  [key: string]: any
}

export type Columns<T = any> = Column<T>[]

export type StringifyColumn<T = any> = Stringify<Column<T>>

export type StringifyColumns<T = any> = StringifyColumn<T>[]

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

export type OnSearchFn<Row = any, Params = Partial<Row>> = (
  params: Params,
  pagination: Pagination
) => Promise<SearchResult<Row> | false | undefined>

export type ActionFn<Params = any> = (params: Params) => Promise<boolean | undefined>

export type ActionType = 'add' | 'delete' | 'edit' | 'view' | 'custom' | (string & {})

export interface TableOptions<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams
> {
  /**
   * 是否使用操作按钮
   */
  excludes?: ActionType[] | ((action: ActionType) => boolean)
  scope?: Record<string, any>
  pagination?: Partial<Pagination>
  actions?: Stringify<Actions<Row>>
  authMap?: Stringify<AuthMap<Row>>
  formProps?: FormProps<SearchParams, AddParams, EditParams>
  formats?: Record<string, FormatFn<Row>>
}

export interface TableHooks<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams
> {
  /**
   * @description 添加事件完成的回调
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 也不会关闭弹窗，需要手动关闭
   */
  onAdd?: ActionFn<AddParams>
  /**
   * @description 删除事件回调
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 可以设置 __deleting__ 字段来标记删除中
   */
  onDelete?: ActionFn<Row & ActionContext>

  /**
   * @description 编辑事件完成的回调
   * 返回 true 时，会自动刷新表格，且关闭弹窗
   * 返回 false 时，不会自动刷新表格, 也不会关闭弹窗，需要手动关闭
   */
  onEdit?: ActionFn<EditParams>
  /**
   * 查
   * @description 搜索事件按钮的回调
   * 返回 false 时，不会自动刷新表格
   */
  onSearch?: OnSearchFn<Row, SearchParams>
}

export interface ActionContext {
  ___deleting____?: boolean
}

export type FormatFn<T = any> = (value: any, record: T, index: number, column: Column<T>) => any
