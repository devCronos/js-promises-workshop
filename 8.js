function attachTitle(title){
    return `DR. ${title}`;
}

var promise = new Promise(function(resolve,reject){
    resolve('MANHATTAN');
})

promise.then(attachTitle).then(console.log);