const MPromise = require('./MPromise')

let promise = new MPromise((resolve,reject)=>{
    setTimeout(function(){
        resolve('异步')
    })
    resolve('同步')
})
// setTimeout(()=>{
//     promise.then(function(value){
//         console.log(value)
//     },function(reason){
//         console.log(reason)
//     })
// },1000)

promise.then(function(value){
    console.log(value)
},function(reason){
    console.log(reason)
})