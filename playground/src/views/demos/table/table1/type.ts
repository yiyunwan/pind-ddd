import type { Pagination } from '@pind/ddd-core'

export interface Table1Row {
  id: number
  name: string
}

export interface Table1AddParams {
  name: string
}

export type Table1ListParams = Omit<Pagination, 'total'> & Table1AddParams

export interface Table1EditParams extends Table1AddParams {
  id: number
}
