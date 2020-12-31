const path = require('path')
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