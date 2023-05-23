import { TableModel, type StringifyColumns } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'
import type { Table1Row } from './type'

const clomuns: StringifyColumns<Table1Row> = []

export const TestTable = defineComponent({
  setup() {
    const crudTable = new TableModel(clomuns, {
      onSearch: async () => {
        return {
          list: [
            {
              id: 1
            }
          ],
          pagination: {
            total: 1,
            page: 1,
            pageSize: 10
          }
        }
      }
    })
    return () => {
      return <CrudTable model={crudTable}></CrudTable>
    }
  }
})
