import { Form } from '@formily/element-plus'
import '@formily/json-schema'
import type { ISchema } from '@formily/json-schema'
import { TableModel } from '@pind/ddd-core'
import { ElDrawer } from 'element-plus'
import { PropType, computed, defineComponent, provide, watch } from 'vue'
import { TableInjectionKey } from '../../contexts'
import { SchemaField } from '../../form'
import { DTable } from './Table'

export const CrudTable = defineComponent({
  name: 'CrudTable',
  props: {
    model: {
      type: Object as PropType<TableModel>,
      required: true
    },
    search: {
      type: Object as PropType<ISchema>,
      default: () => ({})
    },
    add: {
      type: Object as PropType<ISchema>,
      default: () => ({})
    },
    edit: {
      type: Object as PropType<ISchema>,
      default: () => ({})
    }
  },
  setup(props) {
    provide(
      TableInjectionKey,
      computed(() => props.model)
    )

    const schema = computed<ISchema>(() => {
      return {
        type: 'object',
        properties: {
          search: {
            type: 'void',
            properties: {
              searchParams: props.search,
              submit: {
                type: 'void',
                'x-component': 'Submit',
                'x-component-props': {
                  type: 'primary',
                  loading: '{{$table.searching}}',
                  onClick: () => {
                    props.model.search()
                  }
                },
                'x-content': "{{$table.searching ? '搜索中...' : '搜索'}}"
              }
            }
          },
          list: {
            type: 'void',
            'x-component': 'DTable'
          },
          add: {
            type: 'void',
            'x-component': 'ElDrawer',
            'x-component-props': {
              modelValue: '{{$table.isAdding}}',
              onOpen: '{{(value) => $table.isAdding = value}}',
              onClose: '{{(value) => $table.isAdding = value}}',
              title: '新增'
            },
            properties: {
              addParams: props.add
            }
          },
          edit: {
            type: 'void',
            'x-component': 'ElDrawer',
            'x-component-props': {
              modelValue: '{{$table.isEditing}}',
              onOpen: '{{(value) => $table.isEditing = value}}',
              onClose: '{{(value) => $table.isEditing = value}}',
              title: '编辑'
            },
            properties: {
              editParams: props.edit
            }
          }
        }
      }
    })

    watch(
      () => schema.value,
      () => {
        props.model.form.clearFormGraph()
      }
    )

    return () => {
      const form = props.model.form
      return (
        <Form form={form}>
          <SchemaField
            schema={schema.value}
            components={{
              DTable,
              ElDrawer
            }}
            scope={{ $table: props.model }}
          />
        </Form>
      )
    }
  }
})
