import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import { Message, Loading } from 'element-ui'

// 會觸發自動執行
// Vue.use(Message)
Vue.use(Loading.directive)

Vue.prototype.$loading = Loading.service
Vue.prototype.$message = opts => Message({
  type: 'info',
  customClass: 'mat-message',
  showClose: true,
  duration: 5000,
  ...opts
})