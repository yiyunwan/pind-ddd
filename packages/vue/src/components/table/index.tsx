import { PropType, computed, defineComponent, inject, watch } from 'vue'
import { TableInjectionKey } from '../../contexts'
import { TableModel } from '@pind/ddd-core'
import type { ISchema } from '@formily/json-schema'
import '@formily/json-schema'
import { Form } from '@formily/element-plus'
import { SchemaField } from '../../form'
import { DTable } from './Table'
import { ElDrawer } from 'element-plus'

export const CrudTable = defineComponent({
  name: 'CrudTable',
  props: {
    model: {
      type: Object as PropType<TableModel>,
      required: true
    },
    search: {
      type: Object as PropType<ISchema>,
      required: true
    },
    add: {
      type: Object as PropType<ISchema>,
      required: true
    },
    edit: {
      type: Object as PropType<ISchema>,
      required: true
    }
  },
  setup(props) {
    inject(TableInjectionKey)

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
