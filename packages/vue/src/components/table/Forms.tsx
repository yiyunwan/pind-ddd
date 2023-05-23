import { PropType, computed, defineComponent } from 'vue'
import { SchemaForm, SchemaFormProps } from '../../form'
import { useTableModel } from '../../hooks'
import { observer } from '@formily/reactive-vue'
import { ElButton, ElDrawer } from 'element-plus'

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
        console.log('submit')
        await formRef.value.submit()
        console.log('submit')
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
              wrapperWidth: 200,
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
            <ElButton onClick={onCancel}>取消</ElButton>
            <ElButton type="primary" onClick={props.onSubmit} loading={loading}>
              保存
            </ElButton>
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

      const onClosed = () => {
        const model = modelRef.value
        if (props.type === 'add') {
          model.isAdding = false
        } else {
          model.isEditing = false
        }
      }

      return () => {
        const model = modelRef.value
        const open = props.type === 'add' ? model.isAdding : model.isEditing

        return (
          <ElDrawer modelValue={open} onClosed={onClosed}>
            {{ footer: renderFooter, ...slots }}
          </ElDrawer>
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
        model.add()
      }

      return () => {
        return (
          <DrawerForm type="add" onSubmit={onSubmit}>
            <BaseForm {...props} form={formRef.value}>
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
            <BaseForm {...props} form={formRef.value}>
              {slots.default?.()}
            </BaseForm>
          </DrawerForm>
        )
      }
    }
  })
)
