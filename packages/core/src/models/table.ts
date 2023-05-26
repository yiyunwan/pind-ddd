import { Form, IFormMergeStrategy, createForm } from '@formily/core'
import { Schema, Stringify } from '@formily/json-schema'
import { action, define, observable } from '@formily/reactive'
import { clone, merge } from '@formily/shared'
import {
  formatBoolean,
  formatDate,
  formatDateTime,
  formatEnum,
  formatMoney,
  formatNumber,
  formatPercent,
  formatTime
} from '../shared'
import {
  Action,
  ActionContext,
  ActionType,
  Actions,
  Column,
  Columns,
  FormProps,
  FormatFn,
  FormatType,
  Pagination,
  StringifyColumns,
  TableHooks,
  TableOptions
} from '../types'

export class TableModel<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams,
  Hooks extends TableHooks<Row, SearchParams, AddParams, EditParams> = TableHooks<
    Row,
    SearchParams,
    AddParams,
    EditParams
  >
> {
  options: TableOptions<Row, SearchParams, AddParams, EditParams> = {}
  hooks: Hooks

  constructor(
    columns: StringifyColumns<Row> = [],
    hooks?: Hooks,
    options: TableOptions<Row, SearchParams, AddParams, EditParams> = {}
  ) {
    this.setOptions(options)
    this.setHooks(hooks)
    this.setColumns(columns)
    this.setPagination(options.pagination)
    this.createForm(options.formProps)

    this.makeObservable()
  }

  createForm(formProps?: FormProps<SearchParams, AddParams, EditParams>) {
    this.searchForm = createForm(formProps?.search)
    this.addForm = createForm(formProps?.add)
    this.editForm = createForm(formProps?.edit)
  }

  setHooks(hooks?: Hooks) {
    this.hooks = {
      ...this.hooks,
      ...hooks
    }
  }

  setOptions(options: TableOptions<Row, SearchParams, AddParams, EditParams>) {
    this.options = {
      ...this.options,
      ...options
    }
  }

  _columns?: StringifyColumns<Row>

  setColumns(columns: StringifyColumns<Row>) {
    this._columns = clone(columns)
  }

  setColumn(column: Partial<Column<Row>>, strategy: IFormMergeStrategy = 'merge') {
    const _columns = this._columns
    if (Array.isArray(_columns) && typeof column === 'object') {
      const index = _columns.findIndex((item) => {
        if (typeof item === 'object') {
          return item.key === column.key
        }
        return false
      })
      if (index > -1) {
        const result = _columns[index]
        const old = typeof result === 'object' ? result : {}
        switch (strategy) {
          case 'merge':
          case 'deepMerge':
            _columns[index] = merge(old, column)
            break
          case 'shallowMerge':
            _columns[index] = Object.assign(old, column) as any
            break
          case 'overwrite':
            _columns[index] = column as any
            break
        }
      } else {
        _columns.push(column as any)
      }
    }
    this._columns = clone(_columns)
  }

  get columns(): Columns<Row> {
    const columns = this._columns || []
    if (typeof columns === 'string') {
      return this.compile(columns, {
        $column: {},
        $columns: []
      })
    } else if (Array.isArray(columns)) {
      return columns
        .map((column) => {
          if (typeof column === 'string') {
            return this.compile(column, {
              $column: {},
              $columns: columns
            })
          } else if (typeof column === 'object') {
            return this.compile(column, {
              $column: column,
              $columns: columns
            })
          }
        })
        .filter(Boolean) as Columns<Row>
    }
    return []
  }

  useAction(action: ActionType) {
    const { excludes } = this.options
    if (typeof excludes === 'function') {
      return !excludes(action)
    }
    if (Array.isArray(excludes)) {
      return !excludes.includes(action)
    }
    return true
  }

  get actions() {
    const actions = this.compile(this.options.actions || []) as Actions<Row>
    const hasDelAction = actions.some((action) => action.type === 'delete')
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
    if (!hasDelAction && this.useAction('delete')) {
      allActions.unshift({
        type: 'delete',
        text: '删除',
        auth: (row) => {
          return this.auth('delete', row)
        },
        onClick: (row) => {
          this.delete(row)
        }
      })
    }
    if (!hasEditAction && this.useAction('edit')) {
      allActions.unshift({
        type: 'edit',
        text: '编辑',
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

  /**
   * 权限相关
   */
  get authMap() {
    return this.compile(this.options.authMap || {})
  }

  auth(type: ActionType, record: Row) {
    const auth = this.authMap[type]
    if (typeof auth === 'function') {
      return auth(record)
    }
    return auth
  }

  searchForm: Form<SearchParams>
  get searchParams(): SearchParams {
    const searchParams = this.searchForm.values
    return searchParams
  }

  addForm: Form<AddParams>
  get addParams(): AddParams {
    const addParams = this.addForm.values
    return addParams
  }

  editForm: Form<EditParams>
  get editParams(): EditParams {
    const editParams = this.editForm.values
    return editParams
  }

  list: (Row & ActionContext)[] = []

  setPagination(pagination: Partial<Pagination> = {}) {
    this.pagination = {
      ...this.pagination,
      ...pagination
    }
  }

  pagination: Pagination = {
    total: 0,
    page: 1,
    pageSize: 10
  }

  /** ---表格模型增相关逻辑 START--- */
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
    this.addForm.reset()
  }

  async add() {
    if (this.adding) return
    const { onAdd } = this.hooks
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
  /** ---表格模型【增】相关逻辑 END--- */

  /** ---表格模型【删】相关逻辑 START--- */
  async delete(
    row: Row & {
      __deleting__?: boolean
    }
  ) {
    const { onDelete } = this.hooks
    if (row.__deleting__) return
    if (typeof onDelete !== 'function') return
    try {
      row.__deleting__ = true
      const result = await onDelete(row)
      if (result) {
        this.search()
      }
    } finally {
      row.__deleting__ = false
    }
  }
  /** ---表格模型【删】相关逻辑 END--- */

  /** ---表格模型【改】相关逻辑 START--- */
  /**
   * 是否正在编辑, 一般用于弹窗等场景
   */
  isEditing = false

  toEdit(row: Row) {
    this.isEditing = true
    this.editForm.setValues(row)
  }

  /**
   * 正在上传编辑数据
   */
  editing = false

  async edit() {
    if (this.editing) return
    const { onEdit } = this.hooks
    if (typeof onEdit !== 'function') return
    try {
      const { editParams } = this
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
  /** ---表格模型【改】相关逻辑 END--- */

  /** ---表格模型【查】相关逻辑 START--- */
  /**
   * 正在搜索
   */
  searching = false

  toSearch() {
    this.setPagination({
      page: 1
    }) // 重置分页
    this.search()
  }

  search = async () => {
    const { onSearch } = this.hooks
    if (typeof onSearch === 'function') {
      try {
        this.searching = true
        const result = await onSearch(this.searchParams, this.pagination)
        if (!result) return
        const { list, pagination } = result
        this.list = list
        this.setPagination(pagination)
      } finally {
        this.searching = false
      }
    }
  }
  /** ---表格模型【查】相关逻辑 END--- */

  format(row: Row, index: number, column: Column<Row>) {
    const { key, enums } = column
    let type = column.type
    const value = row[key]
    if (!type) {
      // 如果没有指定类型, 但是有枚举, 则使用枚举类型
      if (enums) {
        type = 'enum'
      } else {
        return value
      }
    }
    const format = this.options.formats?.[type] || TableModel.formatMap[type]

    if (typeof format === 'function') {
      return format(value, row, index, column)
    }
    return value
  }

  compile<
    T extends {
      [key: string]: any
    }
  >(source: Stringify<T>, scope = {}): T {
    return Schema.compile(source, {
      ...this.options.scope,
      ...scope,
      $table: this
    })
  }

  protected makeObservable() {
    define(this, {
      pagination: observable,
      isAdding: observable.ref,
      searchForm: observable.ref,
      addForm: observable.ref,
      editForm: observable.ref,
      adding: observable.ref,
      list: observable.ref,
      isEditing: observable.ref,
      editing: observable.ref,
      searching: observable.ref,
      compile: action.bound,
      search: action.bound,
      setPagination: action.bound,
      toAdd: action.bound,
      add: action.bound,
      delete: action.bound,
      toEdit: action.bound,
      edit: action.bound,
      hooks: observable,
      authMap: observable.computed,
      auth: action.bound,
      searchParams: observable.computed,
      addParams: observable.computed,
      editParams: observable.computed,
      actions: observable.computed,
      toSearch: action.bound,
      options: observable,
      columns: observable.computed,
      _columns: observable.ref,
      format: action.bound
    })
  }

  static formatMap: Record<FormatType, FormatFn> = {
    date: formatDate,
    datetime: formatDateTime,
    time: formatTime,
    number: formatNumber,
    boolean: formatBoolean,
    money: formatMoney,
    percent: formatPercent,
    enum: formatEnum
  }

  static registerFormat(type: FormatType, format: FormatFn, override = false) {
    const fn = TableModel.formatMap[type]
    if (typeof fn === 'function') {
      if (override) {
        TableModel.formatMap[type] = format
      } else {
        console.warn(
          `[TableModel] format type ${type} has been registered, please use override mode to override it`
        )
      }
    } else {
      TableModel.formatMap[type] = format
    }
  }

  static registerFormats(formats: Partial<Record<FormatType, FormatFn>>, override = false) {
    Object.keys(formats).forEach((type) => {
      const fn = formats[type as FormatType]
      if (typeof fn !== 'function') {
        console.warn(`[TableModel] format type ${type} must be a function`)
        return
      }
      TableModel.registerFormat(type as FormatType, fn, override)
    })
  }
}

export function createTableModel<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams,
  Hooks extends TableHooks<Row, SearchParams, AddParams, EditParams> = TableHooks<
    Row,
    SearchParams,
    AddParams,
    EditParams
  >
>(
  columns: StringifyColumns<Row> = [],
  hooks?: Hooks,
  options?: TableOptions<Row, SearchParams, AddParams, EditParams>
) {
  return new TableModel(columns, hooks, options)
}
