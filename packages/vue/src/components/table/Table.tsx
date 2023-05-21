import { TableModel } from '@pind/ddd-core'
import { ElTable, ElTableColumn } from 'element-plus'
import { PropType, computed, defineComponent, inject } from 'vue'
import { TableInjectionKey } from '../../contexts'
import { mergeProps } from '../../utils'

export const DTable = defineComponent({
  name: 'DTable',
  props: mergeProps(ElTable, {
    model: {
      type: Object as PropType<TableModel>,
      default: () => ({})
    }
  }),
  setup(props) {
    inject(
      TableInjectionKey,
      computed(() => props.model)
    )

    function renderCloumns() {
      const { model: tableModel } = props
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

    return () => {
      const { model: tableModel, ...tableProps } = props as any
      return (
        <ElTable {...tableProps} data={tableModel.list}>
          {renderCloumns()}
          <div></div>
        </ElTable>
      )
    }
  }
})
