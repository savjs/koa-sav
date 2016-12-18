import * as fs from 'fs'

import Koa from 'koa'

import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'


import schema from 'sav-schema'

const app = new Koa()
const route = new Router()

const UserSchema = schema.declare({
  name: 'UserSchema',
  props: {
    name: String
  }
})

function loadView(view) {
  return new Promise((resolve, reject)=>{
    fs.readFile(`${__dirname}/views/${view}.html`, (err, buf)=>{
      if (err)
        return reject(err)
      return resolve(buf.toString())
    })
  })
}

route.use(async ({ctx}, next)=>{
  // console.log(Object.keys(ctx), ctx.matched, ctx.captures, ctx.params, '---')
  await next()
})

const NestingRoute = new Router()

NestingRoute.get('/nest/:helo', async ({prop, ctx, all, setState, schema, query}) => {
  let str = await all([loadView('index')])
  // console.log(schema.UserSchema.extract(query))
  setState({a:1}, {b:2})
  console.log(ctx.state)
  ctx.body = str[0]
})

route.use(NestingRoute.routes(), NestingRoute.allowedMethods())

function extractStruct(struct, opts) {
  return async ({ctx}, next) => {
    await next()
  }
}

route.get('/', extractStruct(UserSchema), async ({prop, ctx, all, setState, schema, query}) => {
  let str = await all([loadView('index')])
  // console.log(schema.UserSchema.extract(query))
  setState({a:1}, {b:2})
  console.log(ctx.state)
  ctx.body = str[0]
})

function initProp(ctx, name) {
  let prop = (key, value) => {
    Object.defineProperty(ctx, key, {value})
  }
  prop.getter = (key, value) => {
    Object.defineProperty(ctx, key, {get: value})
  }
  prop.setter = (key, value) => {
    Object.defineProperty(ctx, key, {set: value})
  }
  prop(name || 'ctx', ctx)
  prop('prop', prop)
}

function initPromise ({prop}) {
  let PROMISE = Promise
  prop('resolve', PROMISE.resolve.bind(PROMISE))
  prop('reject', PROMISE.reject.bind(PROMISE))
  prop('all', PROMISE.all.bind(PROMISE))
  prop('then', (fn, fail) => {
    return new PROMISE(fn, fail)
  })
}

function initState({prop, resolve}) {
  let state = {}
  prop.getter('state', ()=>state)
  prop('setState', (...args)=>{
    switch (args.length) {
      case 0:
        return resolve(state)
      case 1:
        if (Array.isArray(args[0])) {
          args = args[0]
        } else {
          return resolve(state = {...state, ...args[0]})
        }
    }
    args.push(state)
    resolve(state = Object.assign.apply(state, args))
  })
  prop('replaceState', (newState)=>{
    state = newState || {}
  })
}

function initSchema({prop}) {
  prop('schema', schema)
}

app.use(logger())
app.use(bodyParser({}))

app.use( async (ctx, next)=>{
  initProp(ctx)
  initPromise(ctx)
  initSchema(ctx)
  initState(ctx)
  console.log('bind:ctx')
  await next()
})

app.use( async (ctx, next)=>{
  console.log()
  console.log('url', ctx.url)
  console.log('before')
  await next()
  console.log('after')
})

app.use(route.routes(), route.allowedMethods())
app.listen(8000)

import Account from './account'
