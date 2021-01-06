/*
 * fs模块：Node.js内置模块，用于本地文件系统处理；
 * path模块：Node.js内置模块，用于本地路径解析；
 * buble模块：用于ES6+语法编译
 * flow模块：用于Javascript源码静态检查；
 * zlib模块：Node.js内置模块，用于使用gzip算法进行文件压缩；
 * terser模块：用于Javascript代码压缩和美化。
*/
const path = require('path')
const buble = require('rollup-plugin-buble') //编译ES6+语法为ES2015，无需配置，比babel更轻量；
const alias = require('rollup-plugin-alias') //替换模块路径中的别名
const cjs = require('rollup-plugin-commonjs') //支持CommonJS模块；
const replace = require('rollup-plugin-replace')// 替换代码中的变量为指定值
const node = require('rollup-plugin-node-resolve')// 在打包第三方模块的过程中，rollup无法直接解析npm模块，因此需要引入插件rollup-plugin-node-resolve并配合之前的commonjs插件来解析这些第三方模块
const flow = require('rollup-plugin-flow-no-whitespace')// 插件用来去掉flow使用的类型检查代码
// 从package.json中获取Vue的版本号和Weex的版本号。
const version = process.env.VERSION || require('../package.json').version
const weexVersion = process.env.WEEX_VERSION || require('../packages/weex-vue-framework/package.json').version
const featureFlags = require('./feature-flags')
// 生成了banner文本，在Vue代码打包后，会写在文件顶部。
const banner =
  '/*!\n' +
  ` * Vue.js v${version}\n` +
  ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
  ' * Released under the MIT License.\n' +
  ' */'

// 仅用于打包weex-factory源码时使用
const weexFactoryPlugin = {
  intro () {
    return 'module.exports = function weexFactory (exports, document) {'
  },
  outro () {
    return '}'
  }
}
// alias模块输出一个对象 这个对象定义了所有的别名及其对应的绝对路径
const aliases = require('./alias') 
/*
eg:p:web/entry-runtime.js   
   base:web
   p.slice(base.length + 1):entry-runtime.js  
   aliases[base]:/Users/yulang/Documents/vue/demo/vue-1/src/platforms/weex
   path.resolve(aliases[base], p.slice(base.length + 1)):
   /Users/yulang/Documents/vue/demo/vue-1/src/platforms/weex/entry-runtime.js  
*/


const resolve = p => {
  //  获取第一个斜杠前的字符串 eg:p:web/entry-runtime.js   base:web
  const base = p.split('/')[0] // 获取路径的别名
  if (aliases[base]) { //// 查找别名是否存在     如果匹配到aliases的key值
   // 如果别名存在，则将别名对应的路径与文件名进行合并
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
      // 如果别名不存在，则将项目根路径与传入路径进行合并
    return path.resolve(__dirname, '../', p)
  }
}

const builds = {
  // Runtime only (CommonJS). Used by bundlers e.g. Webpack & Browserify
  
  'web-runtime-cjs-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.dev.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  'web-runtime-cjs-prod': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.prod.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'web-full-cjs-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.dev.js'),
    format: 'cjs',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  'web-full-cjs-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.common.prod.js'),
    format: 'cjs',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime only ES modules build (for bundlers)
  'web-runtime-esm': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.esm.js'),
    format: 'es',
    banner
  },
  // Runtime+compiler ES modules build (for bundlers)
  'web-full-esm': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  'web-full-esm-browser-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.browser.js'),
    format: 'es',
    transpile: false,
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler ES modules build (for direct import in browser)
  'web-full-esm-browser-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.browser.min.js'),
    format: 'es',
    transpile: false,
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // runtime-only build (Browser)
  'web-runtime-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  },
  // runtime-only production build (Browser)
  'web-runtime-prod': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.min.js'),
    format: 'umd',
    env: 'production',
    banner
  },
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  // Runtime+compiler production build  (Browser)
  'web-full-prod': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.min.js'),
    format: 'umd',
    env: 'production',
    alias: { he: './entity-decoder' },
    banner
  },
  // Web compiler (CommonJS).
  'web-compiler': {
    entry: resolve('web/entry-compiler.js'),
    dest: resolve('packages/vue-template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/vue-template-compiler/package.json').dependencies)
  },
  // Web compiler (UMD for in-browser use).
  'web-compiler-browser': {
    entry: resolve('web/entry-compiler.js'),
    dest: resolve('packages/vue-template-compiler/browser.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'VueTemplateCompiler',
    plugins: [node(), cjs()]
  },
  // Web server renderer (CommonJS).
  'web-server-renderer-dev': {
    entry: resolve('web/entry-server-renderer.js'),
    dest: resolve('packages/vue-server-renderer/build.dev.js'),
    format: 'cjs',
    env: 'development',
    external: Object.keys(require('../packages/vue-server-renderer/package.json').dependencies)
  },
  'web-server-renderer-prod': {
    entry: resolve('web/entry-server-renderer.js'),
    dest: resolve('packages/vue-server-renderer/build.prod.js'),
    format: 'cjs',
    env: 'production',
    external: Object.keys(require('../packages/vue-server-renderer/package.json').dependencies)
  },
  'web-server-renderer-basic': {
    entry: resolve('web/entry-server-basic-renderer.js'),
    dest: resolve('packages/vue-server-renderer/basic.js'),
    format: 'umd',
    env: 'development',
    moduleName: 'renderVueComponentToString',
    plugins: [node(), cjs()]
  },
  'web-server-renderer-webpack-server-plugin': {
    entry: resolve('server/webpack-plugin/server.js'),
    dest: resolve('packages/vue-server-renderer/server-plugin.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/vue-server-renderer/package.json').dependencies)
  },
  'web-server-renderer-webpack-client-plugin': {
    entry: resolve('server/webpack-plugin/client.js'),
    dest: resolve('packages/vue-server-renderer/client-plugin.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/vue-server-renderer/package.json').dependencies)
  },
  // Weex runtime factory
  'weex-factory': {
    weex: true,
    entry: resolve('weex/entry-runtime-factory.js'),
    dest: resolve('packages/weex-vue-framework/factory.js'),
    format: 'cjs',
    plugins: [weexFactoryPlugin]
  },
  // Weex runtime framework (CommonJS).
  'weex-framework': {
    weex: true,
    entry: resolve('weex/entry-framework.js'),
    dest: resolve('packages/weex-vue-framework/index.js'),
    format: 'cjs'
  },
  // Weex compiler (CommonJS). Used by Weex's Webpack loader.
  'weex-compiler': {
    weex: true,
    entry: resolve('weex/entry-compiler.js'),
    dest: resolve('packages/weex-template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/weex-template-compiler/package.json').dependencies)
  }
}
  /*  
   *  入口文件 input
   *  引入第三方模块： external为rollup设置外部模块和全局变量
   *  format 打包文件模式
   *  plugins:第三方插件
   *   alies:设置别名，比如将 src 目录设置别名为 @；
   *  output:输出文件
   *  onwarn 拦截警告信息
   */
function genConfig (name) {
  const opts = builds[name]// builds中对应的每一项
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      flow(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue'
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // built-in vars
  const vars = {
    __WEEX__: !!opts.weex, // 是否是weex
    __WEEX_VERSION__: weexVersion, //weex版本
    __VERSION__: version //package.json版本
  }
  // feature flags
  // 功能标志
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })
   //是否要区分环境  区分 就是值赋值给vars['process.env.NODE_ENV']
  if (opts.env) {  
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)  
  }
  config.plugins.push(replace(vars))
  // 除了esm-browser  其它都要添加buble插件 将ES6+代码编译成ES2015标准
  if (opts.transpile !== false) {
    config.plugins.push(buble())
  }
// Object.defineProperty()的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性
  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  // 循环遍历builds对象输出key值，将key值组成的数组传入genConfig函数
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}


/*
rollup-plugin-buble
  @rollup/plugin-buble 模块是rollup的ES6编译插件
功能和babel类似，是简化版的babel
由于是简化版，编译速度比babel快一些
对于其他复杂的ES6+的语法使用，后续再讲讲其他扩展插件

rollup-plugin-alias
用来配置打包过程中各个模块的路径映射，具体的配置写在 build/alias.js 中。
这样代码中就可以用src作为根目录引用模块了。值得注意的是，src/platforms 目录下的
 web 模块和 weex 模块，也都做了映射，所以在看代码时有 import xxx from ‘web/xxx’的引用
 ，就都是从 platforms 下引用的。貌似这是缩短引用路径、区分目录结构和代码逻辑的好方法呢，
 实际开发中也可以借鉴。
 * 
 */
