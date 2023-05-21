import { PropType, ReservedProps } from 'vue'

export type ComponentProps<T> = Omit<
  T extends new (...args: any[]) => { $props: infer P } ? P : never,
  keyof ReservedProps | 'class' | 'style' | 'className'
>
type Data = Record<string, unknown>

type DefaultFactory<T> = (props: Data) => T | null | undefined

export interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null
  required?: boolean
  default?: D | DefaultFactory<D> | null | undefined | object
  validator?(value: unknown): boolean
  /* removed internal: skipCheck */
  /* removed internal: skipFactory */
}
