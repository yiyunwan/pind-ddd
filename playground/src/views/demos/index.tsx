import { defineComponent } from 'vue'
import { Crud } from './table/crud'
import { TabPane, Tabs } from 'ant-design-vue'
import { Format } from './table/format'
import { SetColumn } from './table/SetColumn'
export default defineComponent({
  setup() {
    return () => {
      return (
        <Tabs>
          <TabPane key={1} tab="增删改查">
            <Crud></Crud>
          </TabPane>
          <TabPane key={2} tab="格式化">
            <Format></Format>
          </TabPane>
          <TabPane key={3} tab="修改表头">
            <SetColumn></SetColumn>
          </TabPane>
        </Tabs>
      )
    }
  }
})
