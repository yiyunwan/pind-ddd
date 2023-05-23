import { computed, defineComponent } from 'vue'
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
        const model = modelRef.value
        const renderDefault = () => {
          return (
            <BaseForm {...props} form={formRef.value}>
              {slots.default?.()}
            </BaseForm>
          )
        }
        const renderFooter = () => {
          return (
            <div class="flex justify-end">
              <ElButton onClick={() => (model.isAdding = false)}>取消</ElButton>
              <ElButton type="primary" onClick={onSubmit}>
                保存
              </ElButton>
            </div>
          )
        }
        return (
          <ElDrawer
            modelValue={model.isAdding}
            onClosed={() => {
              model.isAdding = false
            }}
          >
            {{ footer: renderFooter, ...slots, default: renderDefault }}
          </ElDrawer>
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
        const model = modelRef.value
        const renderDefault = () => {
          return (
            <BaseForm {...props} form={formRef.value}>
              {slots.default?.()}
            </BaseForm>
          )
        }
        const renderFooter = () => {
          return (
            <div class="flex justify-end">
              <ElButton onClick={() => (model.isEditing = false)}>取消</ElButton>
              <ElButton type="primary" onClick={onSubmit}>
                保存
              </ElButton>
            </div>
          )
        }
        return (
          <ElDrawer
            modelValue={model.isEditing}
            onClosed={() => {
              model.isEditing = false
            }}
          >
            {{ footer: renderFooter, ...slots, default: renderDefault }}
          </ElDrawer>
        )
      }
    }
  })
)
