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
    username: String,
    password: String,
  }
})

function loadView(view) {
  return new Promise((resolve, reject)=>{
    fs.readFile(`${__dirname}/views/${view}.html`, (err, buf)=>{
      if (err)
        return reject(err)
      buf = buf.toString()
      buf = buf.replace('<!--browser-sync-->',`
<script id="__bs_script__">
  document.write(['<s','cript ', 'async src="http://', location.hostname, ':3000/browser-sync/browser-sync-client.js?v=2.18.5">','</s','cript>' ].join(''));
</script>
  `)
      return resolve(buf)
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

function extractStruct({struct, target = ''}) {
  return async ({ctx}, next) => {
    const input = {
      ...ctx.query, 
      ...ctx.request.body, 
      ...ctx.params
    }
    const ret = await struct.extractThen(input)
    ctx.UserSchema = ret
    await next()
  }
}

function renderView(view) {
  return (ctx) => loadView(view).then((html) => ctx.body = html)
}

async function twait (p) {
  try {
    return [null, await(p) ]
  } catch (err) {
    return [err]
  }
}

route.get('/account/login', renderView('login'))
route.post('/account/login', async function ({ctx}) {
  const input = {
    ...ctx.query, 
    ...ctx.request.body, 
    ...ctx.params
  }
  console.log('query', ctx.query)
  console.log('body', ctx.request.body)
  console.log('params', ctx.params)
  let [err, ret] = await twait(UserSchema.extractThen(input))
  if (ret) {
    if (ret.username === ret.password) {
      console.log('logined')
      return ctx.redirect('/')
    }
  }
  return loadView('login').then((html)=>ctx.body=html.replace('<!-- ERROR_INFO -->', "用户名和密码不相等"))
})

route.get('/', renderView('index'))

// route.get('/', 
//   extractStruct({struct: UserSchema}), 
//   async ({prop, ctx, all, setState, schema, query}) => {
//     let str = await all([loadView('index')])
//     // console.log(schema.UserSchema.extract(query))
//     setState({a:1}, {b:2})
//     console.log(ctx.state)
//     ctx.body = str[0]
// })

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
