import Vue from 'vue'

// 取得 common 下每個 vue 檔案
let requireComponent = require.context('../components/common', false, /\.vue$/)

requireComponent.keys().forEach((fileName) => {
  let config = requireComponent(fileName);
  let componentName = fileName.replace(/^\.\/(.*)\.vue/, "$1")
  Vue.component(componentName, config.default || config);
});
