modules.exports = MPromise;
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
        if(self.status === 'pending'){
            
        }
    }
    function reject(reason){

    }
    executor(resolve,reject)
}