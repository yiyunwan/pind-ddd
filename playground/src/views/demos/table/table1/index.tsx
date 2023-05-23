import { createTableModel, type StringifyColumns } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import type { Table1Row } from './type'
import { AddSchema, SearchSchema } from './schema'
import { add, del, edit, search } from './mock'

import { ElMessage, ElMessageBox } from 'element-plus'

const clomuns: StringifyColumns<Table1Row> = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: '名称',
    key: 'name'
  }
]

export const Table1 = defineComponent({
  setup() {
    const crudTable = createTableModel(clomuns, {
      onSearch: async (params, pagination) => {
        const { code, data, msg } = await search({
          ...params,
          page: pagination.page,
          pageSize: pagination.pageSize
        })
        if (code !== 200) {
          ElMessage.error(msg)
          return
        }
        return data
      },
      onAdd: async (params) => {
        console.log('onAdd', params)
        const { code, msg } = await add(params)
        if (code !== 200) {
          ElMessage.error(msg)
          return
        }
        return true
      },
      onEdit: async (params) => {
        const { code, msg } = await edit(params)
        if (code !== 200) {
          ElMessage.error(msg)
          return
        }
        return true
      },
      onDelete: async (row) => {
        await ElMessageBox.confirm(`确定删除${row.name}?`, 'Warning', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { code, msg } = await del(row.id)
        if (code !== 200) {
          ElMessage.error(msg)
          return
        }
        return true
      }
    })
    return () => {
      return (
        <CrudTable
          model={crudTable}
          add={AddSchema}
          search={SearchSchema}
          edit={AddSchema}
        ></CrudTable>
      )
    }
  }
})
