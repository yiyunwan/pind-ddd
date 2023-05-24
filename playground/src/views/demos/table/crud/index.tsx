import { createTableModel, type StringifyColumns } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import type { CrudRow } from './type'
import { AddSchema, SearchSchema } from './schema'
import { add, del, edit, search } from './mock'
import { message, Modal } from 'ant-design-vue'

const columns: StringifyColumns<CrudRow> = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: '名称',
    key: 'name'
  }
]

export const Crud = defineComponent({
  setup() {
    const crudTable = createTableModel(columns, {
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
      },
      onAdd: async (params) => {
        const { code, msg } = await add(params)
        if (code !== 200) {
          message.error(msg)
          return
        }
        return true
      },
      onEdit: async (params) => {
        const { code, msg } = await edit(params)
        if (code !== 200) {
          message.error(msg)
          return
        }
        return true
      },
      onDelete: async (row) => {
        return new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: '提示',
            content: '确定删除吗？',
            onOk: async () => {
              try {
                const { code, msg } = await del(row.id)
                if (code !== 200) {
                  message.error(msg)
                  resolve(false)
                  return
                }
                resolve(true)
              } catch {
                resolve(false)
              }
            },
            onCancel: () => {
              resolve(false)
            }
          })
        })
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
