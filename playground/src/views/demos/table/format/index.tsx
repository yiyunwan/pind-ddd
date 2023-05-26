import {
  createTableModel,
  TableModel,
  type FormatFn,
  type OnSearchFn,
  type Pagination,
  type StringifyColumns
} from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import type { FormatRow } from './type'
import { SearchSchema } from './schema'
import { search } from './mock'
import { message } from 'ant-design-vue'

const roles = [
  {
    label: '管理员',
    value: 'admin'
  },
  {
    label: '老师',
    value: 'teacher'
  },
  {
    label: '学生',
    value: 'student'
  }
]

const scope = {
  $enum: {
    roles
  }
}

const onSearch: OnSearchFn<FormatRow> = async (
  params: Partial<FormatRow>,
  pagination: Pagination
) => {
  const { page, pageSize } = pagination
  const { code, data, msg } = await search({
    ...params,
    page,
    pageSize
  })
  if (code !== 200) {
    message.error(msg)
    return
  }
  return data
}

const columns: StringifyColumns<FormatRow> = [
  {
    title: 'ID',
    key: 'id',
    sortOrder: 'descend'
  },
  {
    title: '名称',
    key: 'name'
  },
  {
    title: '照片',
    key: 'photo',
    type: 'image'
  },
  {
    title: '出生日期',
    key: 'birthday',
    type: 'date'
  },
  {
    title: '博客',
    key: 'blog',
    type: 'link'
  },
  {
    title: '是否是老师',
    key: 'isTeacher',
    type: 'boolean'
  },
  {
    title: '自定义格式化',
    key: 'custom',
    type: 'custom'
  },
  {
    title: '角色',
    key: 'role',
    color: {
      admin: 'red',
      teacher: 'green'
    },
    type: 'enum',
    enums: '{{$enum.roles}}'
  }
]

const formats: Record<string, FormatFn<FormatRow>> = {
  custom: (value) => {
    return value + '自定义格式化'
  }
}
/**
 * 注册格式化函数, 也可以在全局注册
 */
TableModel.registerFormats(formats, true)

export const Format = defineComponent({
  setup() {
    const formatTable = createTableModel(
      columns,
      {
        onSearch
      },
      {
        excludes: ['delete', 'edit'],
        scope,
        // 局部注册格式化函数，会覆盖全局注册的同名函数
        formats
      }
    )
    return () => {
      return <CrudTable model={formatTable} search={SearchSchema}></CrudTable>
    }
  }
})
