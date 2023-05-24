import '@pind/ddd-core'

import { ComponentProps } from './component'

import { TableColumn, TablePaginationConfig } from 'ant-design-vue'

declare module '@pind/ddd-core' {
  export interface Column extends ComponentProps<typeof TableColumn> {}

  export interface Pagination extends TablePaginationConfig {}
}
