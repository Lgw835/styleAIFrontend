import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Button, Cell } from 'vant'
import 'vant/lib/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { 
  showToast, 
  Notify,
  Field, 
  Form, 
  NavBar, 
  Icon, 
  CellGroup,
  Tabbar,
  TabbarItem,
  Dialog
} from 'vant'

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(Button)
app.use(Field)
app.use(Form)
app.use(NavBar)
app.use(Icon)
app.use(Cell)
app.use(CellGroup)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Dialog)

app.config.globalProperties.$toast = showToast
app.config.globalProperties.$notify = Notify

app.mount('#app')
