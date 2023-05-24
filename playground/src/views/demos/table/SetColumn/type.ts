import type { Pagination } from '@pind/ddd-core'

export interface SetColumnRow {
  id: number
  name: string
}

export interface SetColumnAddParams {
  name: string
}

export type SetColumnListParams = Omit<Pagination, 'total'> & Partial<SetColumnAddParams>

export interface SetColumnEditParams extends SetColumnAddParams {
  id: number
}
