function parsePromised(jsonentry){
    return promise = new Promise(function(resolve,reject){
        try {
            res = JSON.parse(jsonentry);
            resolve(res);
        } catch (error) {
            reject(error);
        }
    })
}


parsePromised(process.argv[2])
.then(null, (e)=>console.log(e.message));