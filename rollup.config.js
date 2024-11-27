import path from 'path'
import fs from 'fs'
import process from 'node:process'
import { rollup } from 'rollup'
import { babel } from '@rollup/plugin-babel'
import { uglify } from '@blaumaus/rollup-plugin-uglify'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import packageConfig from './package.json' with { type: 'json' }

const { version } = packageConfig

const banner
  = '/* eslint-disable */\n'
  + '/*!\n'
  + ` * Vue3-Lazyload.js v${version}\n`
  + ' * A Vue3.x image lazyload plugin' + '\n'
  + ` * (c) ${new Date().getFullYear()} MuRong <admin@imuboy.cn>\n`
  + ' * Released under the MIT License.\n'
  + ' */\n'

const dirname = process.cwd()

const external = [
  'vue'
]

const commonPlugin = [
  commonjs(),
  babel({ babelHelpers: 'bundled' }),
  typescript(),
  nodeResolve(),
]

async function build(options, outputOptions) {
  try {
    const bundle = await rollup(options)
    const { output } = await bundle.generate({
      format: outputOptions.format,
      name: 'VueLazyload',
      globals: {
        vue: 'vue'
      },
      exports: 'named'
    })
    exists()
    await write(path.resolve(dirname, outputOptions.filename), output[0].code)
  }
  catch (e) {
    console.error(e)
  }
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

function blue(str) {
  return `\x1B[1m\x1B[34m${str}\x1B[39m\x1B[22m`
}

function write(dest, code) {
  return new Promise((resolve, reject) => {
    code = banner + code
    fs.writeFile(dest, code, (err) => {
      if (err)
        return reject(err)
      console.log(`${blue(dest)} ${getSize(code)}`)
      resolve('')
    })
  })
}

function exists() {
  const pathE = path.resolve(dirname, 'dist/')
  if (!fs.existsSync(pathE))
    fs.mkdirSync(pathE)
}

build({
  input: path.resolve(dirname, 'src/index.ts'),
  plugins: [
    ...commonPlugin,
    uglify(),
  ],
  external,
}, {
  format: 'umd',
  filename: 'dist/index.min.js',
})

