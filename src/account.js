
function classDecorator(something) {
  return (target) => {
    target.staticValue = something
    return target
  }
}

function methodDecorator(something) {
  return (target, methodName, descriptor) => {
    target[something] = true
    const method = descriptor.value.bind(target)
    descriptor.value = (...args) => {
      console.log('method arguments:', args)
      return method(...args)
    }
    return descriptor
  }
}

function readonly(target, methodName, descriptor) {
  descriptor.writable = false
  return descriptor
}

@classDecorator('static')
export default class Controler {

  @methodDecorator('isBind')
  method() {
    console.log(this.isBind)
  }

  @readonly
  state () {

  }
  
}
