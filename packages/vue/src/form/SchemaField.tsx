import { Form, createForm } from '@formily/core'
import { Form as ElForm, FormLayoutProps } from '@formily/element-plus'
import { ISchema, createSchemaField } from '@formily/vue'
import * as components from './components'
import { PropType, computed, defineComponent } from 'vue'

export const { SchemaField } = createSchemaField({
  components: {
    ...components
  }
})

export const SchemaFormProps = {
  schema: {
    type: Object as PropType<ISchema>
  },
  form: {
    type: Object as PropType<Form>
  },
  scope: {
    type: Object as PropType<any>
  },
  components: {
    type: Object as PropType<any>
  },
  layout: {
    type: Object as PropType<FormLayoutProps>
  },
  onSubmit: {
    type: Function as PropType<(values: any) => void>
  }
}

export const SchemaForm = defineComponent({
  name: 'SchemaForm',
  props: SchemaFormProps,
  setup(props) {
    const formRef = computed(() => {
      return props.form || createForm()
    })
    return () => {
      console.log('SchemaForm', props.scope)
      return (
        <ElForm {...props.layout} form={formRef.value} onAutoSubmit={props.onSubmit}>
          <SchemaField schema={props.schema} scope={props.scope} components={props.components} />
        </ElForm>
      )
    }
  }
})
