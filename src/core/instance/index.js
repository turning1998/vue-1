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
 *  而使用es5向vue原型上挂载方法
 * 
*/
function Vue (options) {

  if (process.env.NODE_ENV !== 'production' &&!(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
// mixin就是向vue上挂一些原型方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
