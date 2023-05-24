import type { Pagination } from '@pind/ddd-core'

export interface CrudRow {
  id: number
  name: string
}

export interface CrudAddParams {
  name: string
}

export type CrudListParams = Omit<Pagination, 'total'> & Partial<CrudAddParams>

export interface CrudEditParams extends CrudAddParams {
  id: number
}
