import { createTableModel, type StringifyColumns } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import type { FormatRow } from './type'
import { SearchSchema } from './schema'
import { search } from './mock'
import { message } from 'ant-design-vue'

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
    title: '角色',
    key: 'role',
    type: 'enum',
    enums: '{{$enum.roles}}'
  }
]

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

export const Format = defineComponent({
  setup() {
    const formatTable = createTableModel(
      columns,
      {
        onSearch: async (params, pagination) => {
          const { code, data, msg } = await search({
            ...params,
            page: pagination.page,
            pageSize: pagination.pageSize
          })
          if (code !== 200) {
            message.error(msg)
            return
          }
          return data
        }
      },
      {
        excludes: ['delete', 'edit'],
        scope: {
          $enum: {
            roles
          }
        }
      }
    )
    return () => {
      return <CrudTable model={formatTable} search={SearchSchema}></CrudTable>
    }
  }
})
