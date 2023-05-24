import { defineComponent } from 'vue'
import { Table1 } from './table/table1'
import { TabPane, Tabs } from 'ant-design-vue'
export default defineComponent({
  setup() {
    return () => {
      return (
        <Tabs>
          <TabPane key={1} tab="增删改查">
            <Table1></Table1>
          </TabPane>
          <TabPane key={2} tab="格式化">
            <Table1></Table1>
          </TabPane>
          <TabPane key={3} tab="修改表头">
            <Table1></Table1>
          </TabPane>
        </Tabs>
      )
    }
  }
})
