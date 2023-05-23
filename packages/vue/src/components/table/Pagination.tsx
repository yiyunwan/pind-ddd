import { observer } from '@formily/reactive-vue'
import { ElPagination } from 'element-plus'
import { defineComponent } from 'vue'
import { useTableModel } from '../../hooks'

export const Pagination = observer(
  defineComponent({
    setup() {
      const modelRef = useTableModel()
      const onCurrentChange = (page: number) => {
        const model = modelRef.value
        model.pagination.page = page
        model.search()
      }

      const onSizeChange = (size: number) => {
        const model = modelRef.value
        model.pagination.pageSize = size
        model.search()
      }

      const onNextClick = () => {
        const model = modelRef.value
        model.pagination.page++
        model.search()
      }

      const onPrevClick = () => {
        const model = modelRef.value
        model.pagination.page--
        model.search()
      }

      return () => {
        const model = modelRef.value
        const { pageSize, page, total, ...pagination } = model.pagination
        return (
          <ElPagination
            small
            background
            {...pagination}
            total={total}
            currentPage={page}
            pageSize={pageSize}
            class="mt-4"
            onCurrent-change={onCurrentChange}
            onSize-change={onSizeChange}
            onNext-click={onNextClick}
            onPrev-click={onPrevClick}
          />
        )
      }
    }
  })
)
