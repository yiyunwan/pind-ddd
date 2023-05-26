import { Button, Table, TableColumn } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { useTableModel } from '../../hooks'
import { observer } from '@formily/reactive-vue'
import { tableProps } from 'ant-design-vue/es/table'
import { formatColor } from '../../utils'

export const DataTable = observer(
  defineComponent({
    name: 'DataTable',
    props: tableProps(),
    setup(props) {
      const tableModelRef = useTableModel()

      function renderColumns() {
        const tableModel = tableModelRef.value
        const { columns } = tableModel
        return columns.map((column) => {
          const { render, key, title, slots, type, enums, visible, color, ...columnProps } = column
          if (visible === false) return null
          const allSlots = {
            ...slots,
            default: ({ record, text, index }: any) => {
              if (typeof render === 'function') return render(text, record, index, column)
              const style = {
                color: ''
              }
              let result = record[key]

              if (color) {
                style.color = formatColor(record, index, column)
              }
              if (type || enums) {
                result = tableModel.format(record, index, column)
              }

              return <span style={style}>{result}</span>
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
        const { actions } = tableModel
        if (!actions.length) return null
        return (
          <TableColumn key="_action" title="操作">
            {{
              default: ({ record, index }: any) => {
                const nodes = actions.map((action) => {
                  const { render, onClick, auth, text, type, props } = action
                  if (typeof auth === 'function' && auth(record) === false) return null
                  const actionProps = {
                    ...props,
                    onClick: () => {
                      if (typeof onClick === 'function') {
                        onClick(record, index)
                      }
                    }
                  }
                  if (typeof render === 'function') {
                    return render(record, index)
                  }
                  return (
                    <Button type="link" {...actionProps} key={type}>
                      {text}
                    </Button>
                  )
                })

                return <span>{nodes}</span>
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
            {...props}
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
            loading={tableModel.searching}
          >
            {renderColumns()}
            {renderActions()}
          </Table>
        )
      }
    }
  })
)
