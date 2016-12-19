
function makeProp(target, propName) {
  return (key, value) => {
    if (typeof key === 'object') {
      for (let name in key) {
        Object.defineProperty(target, name, {[`${propName}`]: key[name]} )
      }
    } else {
      Object.defineProperty(target, key, {[`${propName}`]: value} )
    }
  }
}

function injectProp(ctx, name) {
  let prop = makeProp(ctx, 'value')
  prop.getter = makeProp(ctx, 'get')
  prop.setter = makeProp(ctx, 'set')
  prop(name || 'ctx', ctx)
  prop('prop', prop)
}

function injectPromise ({prop}) {
  prop({
    resolve: Promise.resolve.bind(Promise),
    reject: Promise.reject.bind(Promise),
    all: Promise.all.bind(Promise),
    then: (fn, fail) => {
      return new Promise(fn, fail)
    },
  })
}

function injectState({prop, resolve}) {
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
    return resolve(state = Object.assign.apply(state, args))
  })
  prop('replaceState', (newState)=>{
    return resolve(state = newState || {})
  })
}

export default (target)=> {
  injectProp(target)
  injectPromise(target)
  injectState(target)
}
