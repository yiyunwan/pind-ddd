import { TableModel } from '@pind/ddd-core'
import { CrudTable } from '@pind/ddd-vue'
import { defineComponent } from 'vue'

export const TestTable = defineComponent({
  setup() {
    const crudTable = new TableModel({
      columns: [
        {
          title: 'ID',
          dataIndex: 'id'
        }
      ],
      onSearch: async () => {
        console.log('search')
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
