import { inject } from 'vue'
import { TableInjectionKey } from '../contexts'

export function useTableModel() {
  const tableModelRef = inject(TableInjectionKey)
  if (!tableModelRef?.value) {
    throw new Error(
      'useTableModel must be used after TableModel is provided, please check the order of your components'
    )
  }
  return tableModelRef
}
