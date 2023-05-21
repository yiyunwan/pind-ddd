import { Columns, Pagination, SearchResult, Actions, Auths, Action } from '../types'
import { Form, IFormProps, createForm } from '@formily/core'
import { Schema } from '@formily/json-schema'
import { action, define, observable } from '@formily/reactive'

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
  actions?: Actions<Row>
  auths?: Auths<Row>
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

  get columns() {
    const columns = this.options.columns || []
    return this.compile(columns)
  }

  get actions() {
    const actions = this.compile(this.options.actions || [])
    const hasDelAction = actions.some((action) => action.type === 'del')
    const hasEditAction = actions.some((action) => action.type === 'edit')
    const allActions = actions.map<Action<Row>>((action) => {
      const { auth } = action
      return {
        ...action,
        auth: (row) => {
          if (typeof auth === 'function') {
            return auth(row)
          }
          return auth === undefined ? true : auth
        }
      }
    })
    if (!hasDelAction) {
      allActions.unshift({
        type: 'del',
        text: '删除',
        loading: this.editing,
        auth: (row) => {
          return this.auth('del', row)
        },
        onClick: (row) => {
          this.toDel(row)
        }
      })
    }
    if (!hasEditAction) {
      allActions.unshift({
        type: 'edit',
        text: '编辑',
        loading: this.editing,
        auth: (row) => {
          return this.auth('edit', row)
        },
        onClick: (row) => {
          this.toEdit(row)
        }
      })
    }
    return allActions
  }

  get auths() {
    const auths = this.options.auths || {}
    return this.compile(auths)
  }

  auth(type: string, record: Row) {
    const auth = this.auths[type]
    if (typeof auth === 'function') {
      return auth(record)
    }
    return auth
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

  search = async () => {
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

  compile<T>(source: T): T {
    return Schema.compile(source, {
      $form: this.form,
      $table: this
    })
  }

  protected makeObservable() {
    define(this, {
      pagination: observable,
      isAdding: observable.ref,
      adding: observable.ref,
      isEditing: observable.ref,
      editing: observable.ref,
      searching: observable.ref,
      compile: action.bound,
      search: action.bound,
      setPagination: action.bound,
      toAdd: action.bound,
      add: action.bound,
      toDel: action.bound,
      del: action.bound,
      toEdit: action.bound,
      edit: action.bound
    })
  }
}
