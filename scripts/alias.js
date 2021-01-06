const path = require('path')
// 这个模块中定义了resolve()方法，用于生成绝对路径

// __dirname为当前模块对应的路径，即scripts/目录，
// ../表示上一级目录，即项目的根目录，然后通过path.resolve()方法
// 将项目的根目录与传入的相对路径结合起来形成最终结果
const resolve = p => path.resolve(__dirname, '../', p)
module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
/*
 *
 {
  vue: '/Users/Documents/vue/demo/vue-1/src/platforms/web/entry-runtime-with-compiler',
  compiler: '/Users/Documents/vue/demo/vue-1/src/compiler',
  core: '/Users/Documents/vue/demo/vue-1/src/core',
  shared: '/Users/Documents/vue/demo/vue-1/src/shared',
  web: '/Users/Documents/vue/demo/vue-1/src/platforms/web',
  weex: '/Users/Documents/vue/demo/vue-1/src/platforms/weex',
  server: '/Users/Documents/vue/demo/vue-1/src/server',
  sfc: '/Users/Documents/vue/demo/vue-1/src/sfc'
}
 */