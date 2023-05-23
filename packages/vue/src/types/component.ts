import { ReservedProps } from 'vue'

export type ComponentProps<T> = Omit<
  T extends new (...args: any[]) => { $props: infer P } ? P : never,
  keyof ReservedProps | 'class' | 'style' | 'className'
>
