import { ElButton, ElTable, ElTableColumn } from 'element-plus'
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
            default: ({ row, column, $index }: any) => {
              if (typeof slots?.default === 'function') {
                return slots.default({ row, column, $index })
              }
              if (typeof render === 'function') return render(column, row, $index)

              if (!render) {
                return <span>{row[key]}</span>
              }
            }
          }

          return (
            <ElTableColumn prop={key} label={title} {...columnProps}>
              {allSlots}
            </ElTableColumn>
          )
        })
      }

      function renderActions() {
        const tableModel = tableModelRef.value
        return (
          <ElTableColumn prop="_action" label="操作">
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
                    <ElButton link type="primary" {...actionProps} key={type}>
                      {text}
                    </ElButton>
                  )
                })
              }
            }}
          </ElTableColumn>
        )
      }

      return () => {
        const tableModel = tableModelRef.value
        console.log('tableModel', tableModel.list)
        return (
          <ElTable data={[...tableModel.list]}>
            {renderColumns()}
            {renderActions()}
          </ElTable>
        )
      }
    }
  })
)
