/* @flow */
// vue的初始化过程：
// 找到Vue的定义。
// 然后在Vue下面通过Mixin方法给原型挂载了很多原型方法。
// 又通过initGlobalApi()给vue挂载了很多静态方法
import config from '../config' //全局到config 可查看vue官网api
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {  // 警告不要替换vue.config对象 设置单独的字段
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // vue.config 上定义configDef
  Object.defineProperty(Vue, 'config', configDef)
 
  //vue.util定义了一些暴露出去的util方法但是这些方法并不是公共api
  // 所以vue官方并不建议去使用 因为内部实现不稳定 有风险 可能去修改实现方法
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
// 向vue 添加set delete nexTick方法
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6版本新增api
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  // ASSET_TYPES 定义了全局的components directive filters 方法
  Vue.options = Object.create(null) // options可以用来合并一些方法
  // 是把component，directive，filter挂载到options上面
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

 //_base被用来标识基本构造函数（也就是Vue），以便在多场景下添加组件扩展
  Vue.options._base = Vue
// builtInComponents是一个内置组件，详见components/index，
// 这个文件导出了KeepAlive，由此可以看出KeepAlive其实是Vue的一个内置组件，
// 它通过extend方法扩展到Vue.options.components下面。
  extend(Vue.options.components, builtInComponents)

  initUse(Vue)   // 初始化Vue.use()方法
  initMixin(Vue) // // 初始化全局mixin方法
  initExtend(Vue)  //全局extend方法 // 初始化vue的extend方法
  initAssetRegisters(Vue) //全局方法  // 把component、directive、filter定义到全局
}
