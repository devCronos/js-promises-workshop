first().then(res => second(res).then(secret => secret).then(console.log))