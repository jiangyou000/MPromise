function MPromise(executor){
    //固定this
    let self = this;
    //设置初始状态为pending
    self.status = 'pending';
    //设置promise被resolve的值
    self.value = undefined;
    //设置promise被reject的原因
    self.reason = undefined;

    //promise异步时可以链式then调用，这里用来存放多个then中的回调
    self.onResolvedCallbacks = [];
    self.onRejectedCallbacks = [];

    //new Promise时传入一个executor函数并且执行这个函数，这个函数有两个参数resolve，reject
    function resolve(value){
        //只有在pending状态时才可以改变
        if(self.status === 'pending'){
            setTimeout(function(){
                //promise resolve的值
                self.value = value
                //改变promise 状态
                self.status = 'fulfilled'
                //2.2.6 then可以在同一个promise里被多次调用
                //这里调用resolve方法后promise即变为fulfilled,依次运行then中push的函数
                //2.2.6.1 如果 promise 完成执行（fulfilled）,各个相应的onFulfilled回调 必须根据最原始的then 顺序来调用
                self.onResolvedCallbacks.forEach(cb=>cb(self.value))
            })
        }
    }
    function reject(reason){
        setTimeout(function(){
            if(self.status === 'pending'){
                self.reason = reason;
                self.status = 'rejected'
                self.onRejectedCallbacks.forEach(cb=>cb(self.reason))
            }
        })
    }
    //new Promise时会执行executor方法,executor有可能会抛异常需要try catch
    try {
        executor(resolve,reject)
    } catch (error) {
        reject(error)
    }
    
}
function resolvePromise(promise2,x,resolve,reject){
    //定义一个状态值
    let called = false;
    //2.3.1
    if(promise2 === x){
        return reject(new TypeError('Chaining cycle detected for promise!'))
    }
    if(x instanceof MPromise){
        if(x.status === 'pending'){
            x.then(function(y){
                resolvePromise(promise2,y,resolve,reject)
            },reject)
        }else{
            x.then(resolve,reject)
        }
    }else if(x !=null && ((typeof x === 'function')|| (typeof x === 'object'))){
    //2.3.3另外，如果x是个对象或者方法，这里因为typeof null 也是object
        //2.3.3.2 如果取回的x.then属性的结果为一个异常e,用e作为原因reject promise
        try {
            //2.3.3.1 让x作为x.then
            let then = x.then;
            if(typeof then === 'function'){
                then.call(x,function(y){
                    //2.3.3.3.3 
                    if(called) return;
                    called = true;
                    resolvePromise(promise2,y,resolve,reject)
                },function(reason){
                    //2.3.3.3.3 
                    if(called) return;
                    called = true;
                    reject(reason)
                })
            }else{
                //2.3.3.4 如果then不是一个函数，用x完成(fulfill)promise
                resolve(x)
            }
        } catch (error) {
            //2.3.3.3.3 
            if(called) return;
            called = true;
            reject(error)
        }
    }else{
        // 2.3.4 如果 x既不是对象也不是函数，用x完成(fulfill)promise
        resolve(x)
    }
}
MPromise.prototype.then = function(onFulfilled, onRejected){
    let self = this;
    let promise2;
    //2.2.1 如果onFulfilled和onRejected不是函数，必须忽略
    //2.2.7.3 如果onFulfilled不是一个方法，并且promise1已经完成（fulfilled）,promise2必须使用与promise1相同的值来完成（fulfiled）
    //2.2.7.4  如果onRejected不是一个方法，并且promise1已经被拒绝（rejected）,promise2必须使用与promise1相同的原因来拒绝（rejected）
    onFulfilled = typeof onFulfilled === 'function'?onFulfilled:value=>value;
    onRejected = typeof onRejected === 'function'?onRejected:reason=>{throw reason};
    //then之前是个promise对象有对应的状态
    if(self.status === 'fulfilled'){
        return promise2 = new MPromise(function(resolve,reject){
            setTimeout(function(){
                try {
                    let x = onFulfilled(self.value)
                    resolvePromise(promise2,x,resolve,reject)
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
    if(self.status === 'rejected'){
        return promise2 = new MPromise(function(resolve,reject){
            setTimeout(function(){
                try {
                    let x = onRejected(self.reason)
                    resolvePromise(promise2,x,resolve,reject)
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
    //promise处理异步时会进入到这里
    if(self.status === 'pending'){
        return promise2 = new MPromise(function(resolve,reject){
            self.onResolvedCallbacks.push(function(){
                setTimeout(function(){
                    try {
                        let x = onFulfilled(self.value)
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) {
                        reject(error)
                    }
                })
                
            })
            self.onRejectedCallbacks.push(function(){
                setTimeout(function(){
                    try {
                        let x = onRejected(self.reason)
                        resolvePromise(promise2,x,resolve,reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        })
    }
}
MPromise.prototype.catch = function(onRejected){
    this.then(null,onRejected)
}
module.exports = MPromise;
MPromise.deferred = function(){
    const defer = {}
    defer.promise = new MPromise(function(resolve,reject){
        defer.resolve = resolve;
        defer.reject = reject;
    })
    return defer;
}