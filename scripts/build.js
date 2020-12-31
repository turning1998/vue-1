// 可参考：https://blog.csdn.net/weixin_33881140/article/details/91386659
// 打包文件相关配置
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const terser = require('terser')
if (!fs.existsSync('dist')) { //以同步方式判断dist目录是否存在 ture存在 false不存在
  fs.mkdirSync('dist') //不存在创建dist目录
}
// 引入./config中的文件，然后执行这个文件下的getAllBuilds()方法
let builds = require('./config').getAllBuilds()
// 通过命令行参数构建过滤器
//process 是一个全局变量 它提供当前node.js进程相关的信息，以及控制当前nodejs进程
// 因为是全局变量 无需使用require()引入
if (process.argv[2]) {  //主要针对build：ssr和week形式的
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  //默认执行 npm run build  但也对weex进行过滤
  builds = builds.filter(b => {   //过滤的文件中不包括weex
    return b.output.file.indexOf('weex') === -1
  })
} 
//综上所述，主要是对builds中的值进行过滤操作
build(builds)

function build (builds) {//  对拿到的builds进行一个简单的遍历
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => { //  builds数组从0到最后一个元素执行buildEntry方法
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {    // 真正开始通过rollup对其进行编译
  const output = config.output
  // file 打包文件的绝对路径   banner 头部注释
  const { file, banner } = output  
  const isProd = /(min|prod)\.js$/.test(file)   // 匹配min或者prod.js结尾的文件
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({ output: [{ code }] }) => {
      if (isProd) {
        // // 判断生成的js是否需要压缩
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          toplevel: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {// 必要的时候，在文件中加入console.log
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        // 压缩
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

//获取文件大小
function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}
//错误处理
function logError (e) {
  console.log(e)
}
//输出高亮
function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
  
}
