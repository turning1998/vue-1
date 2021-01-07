/* @flow */
// 初始化 _init等方法相关  包含了vue从创建实例挂载阶段的所有主要逻辑
import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0
// vue 原型上挂载_init方法
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // 1.每个vue的实例上都有一个唯一的属性_uid
    vm._uid = uid++
    let startTag, endTag
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }
  //  2.表示是vue实例
    vm._isVue = true
    // 3.合并配置
    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      /*
        这里把我们传入的options最后都合并到$options上
        例如，vm.$options.el 其实就是 new Vue({
        el: 这里的el
        data: vm.$options.data
        })
       */
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* 2.render代理 */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // 4.初始化生命周期 初始化事件中心 初始化inject  
    // 初始化state 初始化provide 调用生命周期
    vm._self = vm
    initLifecycle(vm)//初始化生命周期
    initEvents(vm) //初始化事件
    initRender(vm) //初始化render方法
    callHook(vm, 'beforeCreate')  // 调用beforeCreate钩子函数
    initInjections(vm)  // 初始化inject
    initState(vm)//  // 初始化props、methods、data、computed与watch
    initProvide(vm) // // 初始化provide
    callHook(vm, 'created')// // 调用created钩子函数
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
     // 格式化组件名
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
   //检测到如果有el属性 则调用vm.$mount方法挂载vm
   // 挂载的目标就是把模板渲染成最终的DOM
     /*
        在$mount之后转化为DOM对象
        这个函数执行完，dom会立刻发生变化
        通俗点说，就是挂载组件
       */
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
