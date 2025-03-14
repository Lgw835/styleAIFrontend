// 创建一个空的store，仅为了兼容性
export default {
  install() {
    // 不执行任何操作，仅为了让app.use(store)不报错
    console.log('使用Pinia替代了Vuex store')
  }
} 