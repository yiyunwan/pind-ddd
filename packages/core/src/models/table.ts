import { Form, IFormMergeStrategy, createForm } from '@formily/core'
import { Schema, Stringify } from '@formily/json-schema'
import { action, define, observable } from '@formily/reactive'
import { clone, merge } from '@formily/shared'
import {
  Action,
  ActionFn,
  Actions,
  AuthMap,
  Column,
  Columns,
  FormProps,
  OnSearchFn,
  Pagination
} from '../types'

export interface TableValues<Row, SearchParams, AddParams = Row, EditParams = AddParams> {
  searchParams: SearchParams
  list: Row[]
  addParams: AddParams
  editParams: EditParams
}

export interface TableOptions<
  Row extends object,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams
> {
  pagination?: Partial<Pagination>
  actions?: Stringify<Actions<Row>>
  authMap?: Stringify<AuthMap<Row>>
  formProps?: FormProps<SearchParams, AddParams, EditParams>
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
   * 返回 true 时，会自动刷新表格
   * 返回 false 时，不会自动刷新表格, 也不会关闭弹窗，需要手动关闭
   */
  onEdit?: ActionFn<EditParams>
  /**
   * 查
   * @description 搜索事件按钮的回调
   * 返回 false 时，不会自动刷新表格
   */
  onSearch?: OnSearchFn<SearchParams, Row>
}

export interface ActionContext {
  ___deleting____?: boolean
}

export class TableModel<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams
> {
  options: TableOptions<Row, SearchParams, AddParams, EditParams>

  constructor(
    columns: Stringify<Columns<Row>> = [],
    options: TableOptions<Row, SearchParams, AddParams, EditParams> = {}
  ) {
    this.options = options
    this.setColumns(columns)
    this.setPagination(options.pagination)
    this.searchForm = createForm(options.formProps?.search)
    this.addForm = createForm(options.formProps?.add)
    this.editForm = createForm(options.formProps?.edit)
    this.makeObservable()
  }

  private _columns?: Stringify<Columns<Row>>

  setColumns(columns: Stringify<Columns<Row>>) {
    this._columns = clone(columns)
  }

  setColumn(column: Column<Row>, strategy: IFormMergeStrategy = 'merge') {
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
            _columns[index] = Object.assign(old, column)
            break
          case 'overwrite':
            _columns[index] = column
            break
        }
      } else {
        _columns.push(column)
      }
    }
    this._columns = clone(column)
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

  get actions() {
    const actions = this.compile(this.options.actions || []) as Actions<Row>
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
        auth: (row) => {
          return this.auth('del', row)
        },
        onClick: (row) => {
          this.delete(row)
        }
      })
    }
    if (!hasEditAction) {
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

  auth(type: string, record: Row) {
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
      total: 0,
      page: 1,
      pageSize: 10,
      ...pagination
    }
  }

  pagination: Pagination

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
  /** ---表格模型【增】相关逻辑 END--- */

  /** ---表格模型【删】相关逻辑 START--- */
  async delete(
    row: Row & {
      __deleting__?: boolean
    }
  ) {
    const { onDelete } = this.options
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
   * 是否正在编辑
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
    const { onEdit } = this.options
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

  search = async () => {
    const { onSearch } = this.options
    if (typeof onSearch === 'function') {
      try {
        this.searching = true
        const result = await onSearch(this.searchParams, this.pagination)
        if (!result) return
        const { list, pagination } = result
        console.log('list', list)
        this.list = list
        this.setPagination(pagination)
      } finally {
        this.searching = false
      }
    }
  }
  /** ---表格模型【查】相关逻辑 END--- */

  compile<
    T extends {
      [key: string]: any
    }
  >(source: Stringify<T>, scope = {}): T {
    return Schema.compile(source, {
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
      edit: action.bound
    })
  }
}

export function createTableModel<
  Row extends object = any,
  SearchParams extends object = Partial<Row>,
  AddParams extends object = Row,
  EditParams extends object = AddParams
>(
  columns: Stringify<Columns<Row>> = [],
  options: TableOptions<Row, SearchParams, AddParams, EditParams> = {}
) {
  return new TableModel(columns, options)
}
