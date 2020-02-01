function all(p1,p2){
    return new Promise(function (fulfill, reject) {
        let counter = 0;
        let result = [];
        p1.then((res)=>{
            counter++;
            result.push(res);
            if(counter>=2) fulfill(result);
        });
        p2.then((res)=>{
            counter++;
            result.push(res);
            if(counter>=2) fulfill(result);
        });
        
    });
}

all(getPromise1(), getPromise2()).then(console.log);