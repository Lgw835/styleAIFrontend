import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Button, Cell } from 'vant'
import 'vant/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Button).use(Cell)

app.mount('#app')
