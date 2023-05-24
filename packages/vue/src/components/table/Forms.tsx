import { PropType, computed, defineComponent } from 'vue'
import { SchemaForm, SchemaFormProps } from '../../form'
import { useTableModel } from '../../hooks'
import { observer } from '@formily/reactive-vue'
import { Button, Drawer } from 'ant-design-vue'

export const props = SchemaFormProps

export const BaseForm = defineComponent({
  name: 'BaseForm',
  props: SchemaFormProps,
  setup(props, { slots }) {
    const modelRef = useTableModel()
    const model = modelRef.value
    return () => {
      return (
        <SchemaForm
          {...props}
          scope={{
            ...props.scope,
            $table: model
          }}
        >
          {slots.default?.()}
        </SchemaForm>
      )
    }
  }
})

export const SearchForm = observer(
  defineComponent({
    name: 'SearchForm',
    props,
    setup(props, { slots }) {
      const modelRef = useTableModel()
      const formRef = computed(() => {
        return props.form || modelRef.value.searchForm
      })
      const onSubmit = async () => {
        const model = modelRef.value
        console.log('model', model)
        await formRef.value.submit()

        model.setPagination({
          page: 1
        }) // 重置分页
        model.search()
      }

      return () => {
        return (
          <BaseForm
            {...props}
            form={formRef.value}
            onSubmit={onSubmit}
            layout={{
              labelWidth: 120,
              layout: 'inline',
              ...props.layout
            }}
          >
            {slots.default?.()}
          </BaseForm>
        )
      }
    }
  })
)

export const DrawerFooter = observer(
  defineComponent({
    name: 'DrawerFooter',
    props: {
      type: {
        type: String as PropType<'add' | 'edit'>
      },
      onSubmit: {
        type: Function as PropType<(values: any) => void>
      }
    },
    setup(props) {
      const modelRef = useTableModel()
      const onCancel = () => {
        const model = modelRef.value
        if (props.type === 'add') {
          model.isAdding = false
        } else {
          model.isEditing = false
        }
      }

      return () => {
        const model = modelRef.value
        const loading = props.type === 'add' ? model.adding : model.editing
        return (
          <div class="flex justify-end">
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={props.onSubmit} loading={loading}>
              保存
            </Button>
          </div>
        )
      }
    }
  })
)

export const DrawerForm = observer(
  defineComponent({
    name: 'DrawerForm',
    props: {
      type: {
        type: String as PropType<'add' | 'edit'>,
        default: 'add'
      },
      onSubmit: {
        type: Function as PropType<(values: any) => void>
      }
    },
    setup(props, { slots }) {
      const modelRef = useTableModel()

      const renderFooter = () => {
        return <DrawerFooter onSubmit={props.onSubmit} type={props.type}></DrawerFooter>
      }

      const onClose = () => {
        const model = modelRef.value
        if (props.type === 'add') {
          model.isAdding = false
        } else {
          model.isEditing = false
        }
      }

      return () => {
        const model = modelRef.value
        const visible = props.type === 'add' ? model.isAdding : model.isEditing

        return (
          <Drawer visible={visible} onClose={onClose}>
            {{ footer: renderFooter, ...slots }}
          </Drawer>
        )
      }
    }
  })
)

export const AddForm = observer(
  defineComponent({
    name: 'AddForm',
    props,
    setup(props, { slots }) {
      const modelRef = useTableModel()
      const formRef = computed(() => {
        return props.form || modelRef.value.addForm
      })
      const onSubmit = async () => {
        const model = modelRef.value
        await formRef.value.submit()
        props.onSubmit?.(formRef.value.values)
        console.log('onSubmit', formRef.value.values)
        model.add()
      }

      return () => {
        return (
          <DrawerForm type="add" onSubmit={onSubmit}>
            <BaseForm
              {...props}
              form={formRef.value}
              scope={{
                ...props.scope,
                $type: 'add'
              }}
            >
              {slots.default?.()}
            </BaseForm>
          </DrawerForm>
        )
      }
    }
  })
)

export const EditForm = observer(
  defineComponent({
    name: 'EditForm',
    props,
    setup(props, { slots }) {
      const modelRef = useTableModel()

      const formRef = computed(() => {
        return props.form || modelRef.value.editForm
      })
      const onSubmit = async () => {
        const model = modelRef.value
        await formRef.value.submit()
        props.onSubmit?.(formRef.value.values)
        model.edit()
      }

      return () => {
        return (
          <DrawerForm type="edit" onSubmit={onSubmit}>
            <BaseForm
              {...props}
              form={formRef.value}
              scope={{
                ...props.scope,
                $type: 'edit'
              }}
            >
              {slots.default?.()}
            </BaseForm>
          </DrawerForm>
        )
      }
    }
  })
)
