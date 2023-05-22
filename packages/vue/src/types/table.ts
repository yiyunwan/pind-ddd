import '@pind/ddd-core'

import { ComponentProps } from './component'

import { ElTableColumn } from 'element-plus'

declare module '@pind/ddd-core' {
  export interface Column extends ComponentProps<typeof ElTableColumn> {}
}
