import { createApp } from 'vue'
import 'element-plus/theme-chalk/src/index.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
