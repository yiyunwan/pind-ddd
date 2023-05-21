import { TableModel } from '@pind/ddd-core'
import { InjectionKey, Ref } from 'vue'

export const TableInjectionKey: InjectionKey<Ref<TableModel>> = Symbol('TableModel')
