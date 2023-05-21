import { Columns, Pagination, SearchResult, Column } from '../types'
import { Form, IFormProps, createForm } from '@formily/core'
import { Schema } from '@formily/json-schema'

export interface IColumn<T> extends Omit<Column, 'render'> {
  render?: string | ((text: any, record: T, index: number) => any)
}

export interface TableValues<Row, SearchParams, AddParams = Row, EditParams = AddParams> {
  searchParams: SearchParams
  list: Row[]
  addParams: AddParams
  editParams: EditParams
}

export interface TableOptions<
  Row extends object,
  SearchParams extends object = object,
  AddParams = Row,
  EditParams = AddParams
> {
  columns?: Columns<Row>
  pagination?: Partial<Pagination>

  form?: Form<TableValues<Row, SearchParams, AddParams, EditParams>>
  formProps?: IFormProps
  /**
   * @description 添加事件完成的回调
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 也不会关闭弹窗，需要手动关闭
   */
  onAdd?: (value: AddParams) => Promise<boolean>
  /**
   * @description 删除事件回调
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 可以设置 _deleting 字段来标记删除中
   */
  onDel?: (
    value: Row & {
      _deleting?: boolean
    }
  ) => Promise<boolean>
  /**
   * @description 编辑事件完成的回调
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 也不会关闭弹窗，需要手动关闭
   */
  onEdit?: (value: EditParams) => Promise<boolean>
  /**
   * 查
   * @description 搜索事件按钮的回调
   * 返回 false 时，不会自动刷新表格
   */
  onSearch?: (params: any) => Promise<SearchResult<Row> | false>
}

export class TableModel<
  Row extends object = object,
  SearchParams extends object = object,
  AddParams = Row,
  EditParams = AddParams
> {
  options: TableOptions<Row, SearchParams, AddParams, EditParams>

  constructor(options: TableOptions<Row, SearchParams, AddParams, EditParams>) {
    this.options = options
    this.setForm(options.form || createForm(options.formProps))
  }

  setForm(form: Form) {
    this.form = form
  }

  form: Form<TableValues<Row, SearchParams, AddParams, EditParams>>

  get columns(): IColumn<Row>[] {
    const columns = this.options.columns || []
    return columns.map<IColumn<Row>>((column) => {
      const _column = { ...column }
      const render = column.render
      if (!render) return _column as IColumn<Row>

      let renderFn!: Function
      if (typeof render === 'string') {
        const renderStr = render
        renderFn = Schema.compile(renderStr, {
          $form: this.form,
          $table: this
        })
      }
      if (typeof render === 'function') {
        renderFn = render
      }

      if (typeof renderFn === 'function') {
        column.render = (text: any, record: Row, index: number) => {
          return renderFn(text, record, index, this)
        }
      }

      return _column as IColumn<Row>
    })
  }

  get list(): Row[] {
    const { list } = this.form.values
    return list
  }

  get searchParams(): SearchParams {
    const { searchParams } = this.form.values
    return searchParams
  }

  setPagination(pagination?: Partial<Pagination>) {
    this.pagination = {
      total: 0,
      page: 1,
      pageSize: 10,
      ...pagination
    }
  }

  pagination: Pagination

  get addParams(): AddParams {
    const { addParams } = this.form.values
    return addParams
  }
  /**
   * 是否正在添加
   */
  isAdding = false

  /**
   * 正在上传添加数据
   */
  adding = false

  toAdd() {
    this.isAdding = true
    this.form.setValuesIn('addParams', {})
  }

  async add() {
    if (this.adding) return
    const { onAdd } = this.options
    if (typeof onAdd !== 'function') return
    try {
      this.adding = true
      const result = await onAdd(this.addParams)
      if (result) {
        this.search()
        this.isAdding = false
      }
    } finally {
      this.adding = false
    }
  }

  toDel(row: Row & { _deleting?: boolean }) {
    this.form.setValuesIn('delParams', row)
  }

  async del(
    row: Row & {
      _deleting?: boolean
    }
  ) {
    const { onDel } = this.options
    if (row._deleting) return
    if (typeof onDel !== 'function') return
    try {
      row._deleting = true
      const result = await onDel(row)
      if (result) {
        this.search()
      }
    } finally {
      row._deleting = false
    }
  }

  toEdit(row: Row) {
    this.isEditing = true
    this.form.setValuesIn('editParams', row)
  }

  /**
   * 是否正在编辑
   */
  isEditing = false

  /**
   * 正在上传编辑数据
   */
  editing = false

  async edit() {
    if (this.editing) return
    const { onEdit } = this.options
    if (typeof onEdit !== 'function') return
    try {
      const { editParams } = this.form.values
      this.editing = true
      const result = await onEdit(editParams)
      if (result) {
        this.search()
        this.isEditing = false
      }
    } finally {
      this.editing = false
    }
  }

  /**
   * 正在搜索
   */
  searching = false

  async search() {
    const { onSearch } = this.options
    if (typeof onSearch === 'function') {
      try {
        this.searching = true
        const result = await onSearch(this.searchParams)
        if (result === false) return
        const { list, pagination } = result
        this.form.setValuesIn('list', list)
        this.setPagination(pagination)
      } finally {
        this.searching = false
      }
    }
  }
}
