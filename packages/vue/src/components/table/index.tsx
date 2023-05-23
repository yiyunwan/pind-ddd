import { ISchema } from '@formily/vue'
import { TableModel } from '@pind/ddd-core'
import { PropType, computed, defineComponent, provide } from 'vue'
import { TableInjectionKey } from '../../contexts'
import { AddForm, EditForm, SearchForm } from './Forms'
import { DataTable } from './Table'
import './style.scss'
import { Pagination } from './Pagination'
import { observer } from '@formily/reactive-vue'

export const CrudTable = observer(
  defineComponent({
    name: 'CrudTable',
    props: {
      model: {
        type: Object as PropType<TableModel>,
        required: true
      },
      search: {
        type: Object as PropType<ISchema>
      },
      add: {
        type: Object as PropType<ISchema>
      },
      edit: {
        type: Object as PropType<ISchema>
      },
      components: {
        type: Object as PropType<any>
      },
      scope: {
        type: Object as PropType<any>
      }
    },
    setup(props) {
      provide(
        TableInjectionKey,
        computed(() => props.model)
      )

      return () => {
        return (
          <ProvideTable model={props.model}>
            <SearchForm schema={props.search} components={props.components} scope={props.scope} />
            <DataTable />
            <Pagination />
            <AddForm schema={props.add} components={props.components} scope={props.scope} />
            <EditForm schema={props.edit} components={props.components} scope={props.scope} />
          </ProvideTable>
        )
      }
    }
  })
)

export const ProvideTable = defineComponent({
  name: 'ProvideTable',
  props: {
    model: {
      type: Object as PropType<TableModel>,
      required: true
    }
  },
  setup(props, { slots }) {
    provide(
      TableInjectionKey,
      computed(() => props.model)
    )
    return () => {
      return <>{slots.default?.()}</>
    }
  }
})
