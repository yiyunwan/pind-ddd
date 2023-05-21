import { createSchemaField } from '@formily/vue'
import * as components from './components'

export const { SchemaField } = createSchemaField({
  components: {
    ...components
  }
})
