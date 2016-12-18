import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import path from 'path'

export default {
  entry: path.resolve(__dirname, './src/server.js'),
  dest: path.resolve(__dirname, './dist/app.js'),
  format: 'cjs',
  // moduleName: "app",
  sourceMap: false,
  useStrict: false,
  external: [
    'fs',
    'koa',
    'koa-router',
    'koa-bodyparser',
    'koa-logger',
    'sav-schema',
  ],
  plugins: [
    babel({
      babelrc: false,
      externalHelpers: true,
      exclude: 'node_modules/**',
      "presets": [
        "stage-0",
        "react"
      ],
      "plugins": [
        "transform-decorators-legacy",
        "external-helpers"
      ]
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
  ]
}