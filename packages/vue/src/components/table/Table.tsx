import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import { defineComponent } from 'vue'
import { useTableModel } from '../../hooks'

export const DTable = defineComponent({
  name: 'DTable',
  setup() {
    const tableModelRef = useTableModel()

    function renderCloumns() {
      const tableModel = tableModelRef.value
      const { columns } = tableModel
      return columns.map((column) => {
        const { render, dataIndex, title, slots, ...columnProps } = column

        const allSlots = {
          ...slots,
          default: ({ row, column, $index }: any) => {
            if (typeof slots?.default === 'function') {
              return slots.default({ row, column, $index })
            }
            if (!render) return row[dataIndex]
            if (typeof render === 'function') return render(column, row, $index)
          }
        }

        return (
          <ElTableColumn prop={dataIndex} label={title} {...columnProps}>
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
                const { render, onClick, auth, text, type, ...actionProps } = action
                if (typeof auth === 'function' && auth(row) === false) return null
                const allActionProps = {
                  ...actionProps,
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
                  <ElButton {...allActionProps} key={type}>
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
      return (
        <ElTable data={tableModel.list}>
          {renderCloumns()}
          {renderActions()}
        </ElTable>
      )
    }
  }
})
