import { Button, Table, TableColumn } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { useTableModel } from '../../hooks'
import { observer } from '@formily/reactive-vue'
import dayjs from 'dayjs'

export const DataTable = observer(
  defineComponent({
    name: 'DataTable',
    setup() {
      const tableModelRef = useTableModel()

      function renderColumns() {
        const tableModel = tableModelRef.value
        const { columns } = tableModel
        return columns.map((column) => {
          const { render, key, title, slots, type, enums, ...columnProps } = column

          const allSlots = {
            ...slots,
            default: ({ record, text, index }: any) => {
              if (typeof render === 'function') return render(text, record, index)

              if (!render) {
                let result = record[key]
                if (type === 'enum') {
                  const item = enums?.find((item) => item.value === result)
                  if (item) result = item.label
                } else if (type === 'boolean') {
                  result = result ? '是' : '否'
                } else if (type === 'date') {
                  result = dayjs(result).format('YYYY-MM-DD')
                } else if (type === 'datetime') {
                  result = dayjs(result).format('YYYY-MM-DD HH:mm:ss')
                } else if (type === 'percent') {
                  result = `${result}%`
                } else if (type === 'money') {
                  result = `¥${result}`
                } else if (type === 'image') {
                  result = <img src={result} style={{ width: '100px' }} />
                } else if (type === 'html') {
                  result = <div innerHTML={result}></div>
                } else if (type === 'json') {
                  result = <pre>{JSON.stringify(result, null, 2)}</pre>
                } else if (type === 'link') {
                  result = (
                    <a href={result} target="__blank">
                      {result}
                    </a>
                  )
                }

                return <span>{result}</span>
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
