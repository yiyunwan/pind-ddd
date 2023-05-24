import { ISchema } from '@formily/vue'
import { TableModel } from '@pind/ddd-core'
import { PropType, computed, defineComponent, onMounted, provide } from 'vue'
import { TableInjectionKey } from '../../contexts'
import { AddForm, EditForm, SearchForm } from './Forms'
import { DataTable } from './Table'
import './style.less'
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
      },
      initSearch: {
        type: Boolean,
        default: true
      }
    },
    setup(props) {
      provide(
        TableInjectionKey,
        computed(() => props.model)
      )

      onMounted(() => {
        if (props.initSearch) {
          props.model.search()
        }
      })

      return () => {
        return (
          <ProvideTable model={props.model}>
            <SearchForm schema={props.search} components={props.components} scope={props.scope} />
            <DataTable />
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
