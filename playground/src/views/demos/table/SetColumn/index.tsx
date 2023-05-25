import { createTableModel, type StringifyColumns } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import { SearchSchema } from './schema'
import { search } from './mock'
import { message } from 'ant-design-vue'

const columns: StringifyColumns<any> = [
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
    title: '展示是否是老师',
    key: 'showIsTeacher',
    type: 'boolean'
  }
]

export const SetColumn = defineComponent({
  setup() {
    const setColumnTable = createTableModel(
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
          if (data && data.list) {
            const showIsTeacher = data.list.some((item: any) => item.showIsTeacher)
            setColumnTable.setColumn({
              key: 'showIsTeacher',
              visible: showIsTeacher
            })
          }
          return data
        }
      },
      {
        excludes: ['delete', 'edit']
      }
    )
    return () => {
      return <CrudTable model={setColumnTable} search={SearchSchema}></CrudTable>
    }
  }
})
