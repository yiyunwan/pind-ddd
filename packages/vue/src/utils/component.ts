import { Prop, type PropType } from 'vue'
import { ComponentProps } from '../types'

export function mergeProps<
  Component extends new (...args: any[]) => { $props: any },
  Props extends Record<string, Prop<any>> = Record<string, Prop<any>>,
  CProps = ComponentProps<Component>
>(
  component: Component,
  newProps: Props
): {
  [K in keyof CProps]: PropType<CProps[K]>
} & Props {
  const props = (component as any).props
  return {
    ...props,
    ...newProps
  }
}
