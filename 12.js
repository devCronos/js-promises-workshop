var HTTP = require("q-io/http");
// Fetch JSON from [http://](http://) and console.log

var test = HTTP.read("http://localhost:1337");
test.then((res) => console.log(JSON.parse(res))).done();