import { Button, Table, TableColumn } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { useTableModel } from '../../hooks'
import { observer } from '@formily/reactive-vue'

export const DataTable = observer(
  defineComponent({
    name: 'DataTable',
    setup() {
      const tableModelRef = useTableModel()

      function renderColumns() {
        const tableModel = tableModelRef.value
        const { columns } = tableModel
        return columns.map((column) => {
          const { render, key, title, slots, ...columnProps } = column

          const allSlots = {
            ...slots,
            default: ({ record, text, index }: any) => {
              if (typeof render === 'function') return render(text, record, index)

              if (!render) {
                return <span>{record[key]}</span>
              }
            }
          }

          return (
            <TableColumn key={key} title={title} {...columnProps}>
              {allSlots}
            </TableColumn>
          )
        })
      }

      function renderActions() {
        const tableModel = tableModelRef.value
        return (
          <TableColumn key="_action" title="操作">
            {{
              default: ({ row, $index }: any) => {
                const { actions } = tableModel

                return actions.map((action) => {
                  const { render, onClick, auth, text, type, props } = action
                  if (typeof auth === 'function' && auth(row) === false) return null
                  const actionProps = {
                    ...props,
                    onClick: () => {
                      if (typeof onClick === 'function') {
                        onClick(row, $index)
                      }
                    }
                  }
                  if (typeof render === 'function') {
                    return render(row, $index)
                  }
                  return (
                    <Button type="link" {...actionProps} key={type}>
                      {text}
                    </Button>
                  )
                })
              }
            }}
          </TableColumn>
        )
      }

      return () => {
        const tableModel = tableModelRef.value
        const { pagination } = tableModel
        const { page, onChange, ..._pagination } = pagination
        return (
          <Table
            dataSource={tableModel.list.slice()}
            pagination={{
              current: page,
              ..._pagination,
              onChange: (page, pageSize) => {
                tableModel.setPagination({
                  page,
                  pageSize
                })
                tableModel.search()
                onChange?.(page, pageSize)
              }
            }}
          >
            {renderColumns()}
            {renderActions()}
          </Table>
        )
      }
    }
  })
)
