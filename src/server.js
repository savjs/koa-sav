import * as fs from 'fs'

import Koa from 'koa'

import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import schema from 'sav-schema'
import inject from './inject'

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

function extractStruct({struct}) {
  return async ({ctx}, next) => {
    await next()
  }
}

route.get('/', 
  extractStruct({struct: UserSchema}), 
  async ({prop, ctx, all, setState, schema, query}) => {
    let str = await all([loadView('index')])
    // console.log(schema.UserSchema.extract(query))
    setState({a:1}, {b:2})
    console.log(ctx.state)
    ctx.body = str[0]
})

function initSchema({prop}) {
  prop('schema', schema)
}

app.use(logger())
app.use(bodyParser({}))

app.use( async (ctx, next)=>{
  inject(ctx)

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
