import type { Pagination } from '@pind/ddd-core'

export interface FormatRow {
  id: number
  name: string
}

export interface FormatAddParams {
  name: string
  photo: string
}

export type FormatListParams = Omit<Pagination, 'total'> & Partial<FormatAddParams>

export interface FormatEditParams extends Partial<FormatAddParams> {
  id: number
}
