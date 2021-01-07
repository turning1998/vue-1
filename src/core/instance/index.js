// VUE第一步：向vue上挂载许多原型方法和静态方法 
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
// vue 的定义

/*vue的定义
 *  vue 必须通过new的方式 实例化
 *  vue未使用es6的方式【class】而是使用function的方法实现
 *  es6实现向vue上挂一些原型方法比较难写；
 *  而使用es5向vue原型上挂载方法 并且可以把这些方法拆分到不同到文件下【eg init state...】
 * 方便代码管理
 * 
*/
function Vue (options) {
// 函数内部也使用了instanceof操作符来判断实例的父类是否为Vue构造函数，不是的话则在开发环境下输出一个警告信息。
  if (process.env.NODE_ENV !== 'production' &&!(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // VUE  原型上的方法  src/core/instance/init.js  _init方法是在initMixin中定义的
  this._init(options)
}
// mixin就是向vue上挂一些原型方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
