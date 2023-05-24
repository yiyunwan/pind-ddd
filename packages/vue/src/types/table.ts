import '@pind/ddd-core'
import { Options } from '@pind/ddd-shared'

import { ComponentProps } from './component'

import { TableColumn, TablePaginationConfig } from 'ant-design-vue'

declare module '@pind/ddd-core' {
  export interface Column extends ComponentProps<typeof TableColumn> {
    type?:
      | 'text'
      | 'link'
      | 'enum'
      | 'date'
      | 'datetime'
      | 'currency'
      | 'percent'
      | 'money'
      | 'image'
      | 'html'
      | 'json'
      | 'boolean'
    enums?: Options
  }

  export interface Pagination extends TablePaginationConfig {}
}
