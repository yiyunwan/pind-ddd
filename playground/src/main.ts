import { createApp } from 'vue'
import 'ant-design-vue/dist/antd.less'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
