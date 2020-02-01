# What is a promise?

One of the new features in **ECMAScript 2015** (also called “ES6” and
“Harmony”) is a new type of objects: promises. It extends the widely known
**Promise/A+** specification and standardizes it to be part of the language
core.

In its most basic terms, a promise is an object that defines a method called
`then`. The promise object represents a value that may be available some time
in the future. It greatly simplifies asynchronous logic in JavaScript.

Compare the following code, written in the more traditional idiom of
asynchronous callbacks, with no error handling:

```js
Parse.User.logIn('user', 'pass', {
  success: function (user) {
    query.find({
      success: function (results) {
        results[0].save({ key: value }, {
          success: function (result) {
            // the object was saved
          }
        });
      }
    });
  }
});
```

And the much more elegant Promise workflow, with first-class error handling:

```js
Parse.User.logIn('user', 'pass').then(function (user) {
  return query.find();
}).then(function (results) {
  return results[0].save({ key: value });
}).then(function (result) {
  // the object was saved
}).catch(function (err) {
  // an error happened somewhere in the process
});
```

Promises make writing performant, asynchronous code much easier and more fun.



# Fulfilling a Promise

Promises have an important internal property: its state. A promise is one of:

* fulfilled,
* rejected, or
* pending, which is the state of a promise waiting to be fulfilled or rejected.

Sometimes you will also hear the term “resolved.” For now, you can treat it as
meaning either fulfilled or rejected.

Most promises are created with `new Promise(executor)`, in which `executor` is
a callback function with the signature `function (fulfill, reject)`. Inside
`executor`, either `fulfill` or `reject` is called, to indicate the outcome of
the operation. For promises, fulfilling means that the operation successfully
completes and yields a value. In order to pass this value along, call `fulfill`
function with this value as the first parameter.

As mentioned in the last lesson, a promise has a `then` property function. It
is the main way of manipulating promises and their values. It takes two
optional callback parameters `onFulfilled` and `onRejected`: the first will be
called when the promise is fulfilled, and the second when the promise is
rejected.  When the `fulfill` function is called in `executor` with a value,
the promise internals pass it along, and then call this first callback with the
same value.

In practice, you can call the `then` property function multiple times, to do
multiple things with the value of the promise. Or, more commonly, you could do
them all in the same `onFulfilled` callback, which allows you to control more
easily the logic flows.

If you call `fulfill` function in `executor` without a parameter, the
`onFulfilled` callback(s) will still be called, but the parameter to those
callbacks will be `undefined`.

We will talk about rejecting in our next lesson.

## Setup

To use ES2015 Promises, you need either a JavaScript engine that supports it,
or one of the many polyfills available. Node.js 0.12 or higher, and all
versions of io.js, have native promise support. However, if you are stuck with
an older version of Node.js, don’t fret: for this workshopper, a promise
implementation will be **automatically supplied** if none is available.

When writing your own code, we recommend using `es6-promise` polyfill, since it
aims to be strictly compliant to ES2015 without any extra features. To use
`es6-promise`, execute the following in a shell:

```sh
npm install es6-promise
```

Then, in the main file in your app, add the following line:

```js
require('es6-promise');
```

Now you can use ES2015 promises everywhere!


# Rejecting a Promise

After the last session, you should be able to create a promise, fulfill it
with a value, and read that value after the fulfillment of the promise. Now,
not all promises result in a successful execution; some errors may have
happened in the process. That's where promise rejection comes into play.

When a promise is rejected, this is typically (though not always) used to
indicate that a value was not successfully obtained by the promise. Promises
provide a way to pass the specific error that prevents the successful
execution.

Once a promise has been rejected, it can never be fulfilled (nor rejected
again). This aspect of promises will be explored deeper in the next lesson.

# What happens if we reject AND resolve a promise?

The **ES2015** spec states that a promise, once fullfilled or rejected, may
**not** change states for the rest of its lifetime.  This is an important
feature of promises and it is also one of the things that differentiates it
from an `EventEmitter` (and other forms of repeatable callbacks).

Callback-style code usually requires a callback function to be invoked
somewhere in the body of the function that it was passed to.  Many, if not
most times, that function is intended to be called only once.  However, through
errors in logic, problems with syntax, or other simple mistakes it is
possible to call your callback multiple times and create vexing states in your
app or insidious bugs.

```js
/*
 * This code is bad, but nonetheless common and has the nasty result of
 * calling the supplied callback more than once (possibly destroying the
 * earth?). It is conventional to return the first invocation of callback
 * but it’s easy to overlook!
 */

function myFunc(user, callback) {
  if (user) {
    callback(null, user);
  }

  return callback('No user was found', null);
}
```

# Are promises always resolved asynchronously?

The ES2015 spec declares that promises **must not** fire their
resolution/rejection function on the same turn of the event loop that they are
created on. This is very important because it eliminates the possibility of
execution order varying and resulting in indeterminate outcomes.

You can expect that the functions passed to the `then` method of a
promise will be called on the **next** turn of the event loop.

# Promise me... quicker

The ES2015 specification defines some shortcuts that make creating and working
with promises faster and easier.

The first is `.catch`. So far we already know how to handle the rejection of a
promise -- through the second parameter to `.then` function. However,
sometimes you only want to handle the rejection and not success. In these
cases, since the `onFulfilled` callback is optional, you can specify `null` in
place of it.  However, a much easier way to achieve this is to use `.catch`.
Instead of having to write

```js
promise.then(null, function (err) {
  console.error('THERE IS AN ERROR!!!');
  console.error(err.message);
});
```

You could simply write

```js
promise.catch(function (err) {
  console.error('THERE IS AN ERROR!!!');
  console.error(err.message);
});
```

This notation also has the benefit of making the syntax easier to understand for
people who do not speak Promises yet, since it is fairly obvious to everyone
who has done JavaScript programming to understand what `catch` means.

The second and third are `Promise.resolve` and `Promise.reject`. The code
examples below will tell you exactly what they do:

```js
// The way you have learned: create promise through the constructor.

var promise = new Promise(function (fulfill, reject) {
  fulfill('SECRET VALUE');
});

// Introducing: Promise.resolve
// It does the exact same thing as above:

var promise = Promise.resolve('SECRET VALUE');


// Likewise...

var promise = new Promise(function (fulfill, reject) {
  reject(new Error('SECRET VALUE'));
});

var promise = Promise.reject(new Error('SECRET VALUE'));
```

# Promise followed by promises

So far, you have handled promise fulfillment and rejection, but all your
handlers have been done synchronously like printing text. What if you want to
do something asynchronously?

Let us refer back to the example we used in the first lesson.

```js
Parse.User.logIn('user', 'pass', {
  success: function (query) {
    query.find({
      success: function (results) {
        results[0].save({ key: value }, {
          success: function (result) {
            // the object was saved
          }
        });
      }
    });
  }
});
```

Now, if all three functions return promises, you should be able to translate
this code into:

```js
Parse.User.logIn('user', 'pass').then(function (query) {
  query.find().then(function (results) {
    results[0].save({ key: value }).then(function (result) {
      // the object was saved
    });
  });
});
```

That’s quite a lot better: the awkward `success` property functions have been
replaced. However, the despised pattern of “callback hell” is still there: if
you want to do more than three things the code will rack up fairly quickly.

To solve this problem, promises allow you to **return another promise** in the
`then` function callbacks. This new promise you return in the promise will in
turn be returned by `then`, so you can use it to do something after both of
the actions are done. For example, the above code can be replaced by:

```js
var originalPromise = Parse.User.logIn('user', 'pass');

var findPromise = originalPromise.then(function (query) {
  // At this point, you have logged in.

  // query.find() returns another promise, which will become `findPromise`
  return query.find();
});

var savePromise = findPromise.then(function (results) {
  // At this point, the query finding is done.

  // The promise returned by `save` will become `savePromise`
  return results[0].save({ key: value });
});

savePromise.then(function (result) {
  // the object was saved
});
```

which can then be simplified to:

```js
Parse.User.logIn('user', 'pass').then(function (query) {
  return query.find();
}).then(function (results) {
  return results[0].save({ key: value });
}).then(function (result) {
  // the object was saved
});
```

That’s quite beautiful, no?

# Do I HAVE to return promises?

**No!** Fulfillment handlers may return promises **or** values. Your Promises
library will do the correct thing and wrap your return value in a promise if
need be. This is awesome because it allows you to intermix values with
promises in a chain.

Imagine that you have a cache of models that may already contain a model you
would like to request from the server. You could check your cache
synchronously and return the found value **or** send an AJAX request to your
remote server to fetch it.

Wrapping this functionality in a promise means that both behaviors can be
consumed under a single abstraction:

```js
doSomeSetup()
  .then(function () {
    return cache.fetchModel(id) || promisedAjax("users/" + id);
  })
  .then(displayUser)
```

The key thing to understand here is that your handlers will **wrap** your
return values in promises even if they are obtained synchronously.

Another very important point to understand is that, as discussed before, the
returned value will resolve on the **next** turn of the event loop.

# What happens when an error is thrown?

One of the tremendous strengths of promises is that they handle errors in a
manner similar to synchronous code.  Unlike in traditional callback-based code,
you do not need to strictly handle all your errors at every step.

If an error is thrown inside a function, it can be captured.

If an error is thrown inside a function, it will be handled by the next
available *"rejection"* handler.  This allows you to write code that looks
remarkably like a `try`/`catch` block would in synchronous code.

```js
try {
  doSomethingRisky();
  doAnotherRiskyThing();
} catch (e) {
  console.log(e.message);
}
```

The equivalent "promisified" code might look like:

```js
doSomethingRisky()
.then(doAnotherRiskyThing)
.then(null, console.log);
```


# There's always a catch… (lol pun)

Promises are designed to emulate synchronous control flows.
If any of them throw an exception, the exception will bubble up
through the stack until it is caught by a catch block or
hits the global context where it will be thrown.

In the code below, each expression is evaluated one after the
other.  If any expression throws an exception, **all subsequent
expressions will not be executed** and the catch block
will catch and handle it.

```js
try {
  doStuff()
  doMoreStuff()
} catch (err) {
  complainAboutJavascript(err);
}
```

With promises, we can achieve a very similar control flow as shown
(assume all functions return promises):

```js
doStuff()
.then(doMoreStuff)
.then(null, complainAboutJavascript);
```

Maybe we should combine the last two lines since one is a fulfill
handler and the other is a rejection handler?  **NO!**  While this
might initially seem sensible consider what would happen if
`doMoreStuff` threw an error.  Since the promise returned from it
would be rejected, it would look for the **next** rejection handler
to handle it.

Remember: A promise can **never** resolve more than once.

It is, therefore, a best practice to always put a rejection handler
at the bottom of your promise chain (much like a catch block).

It is worth pointing out that both the synchronous **and** asynchronous
code have the same problem.  If the rejection handler itself throws
an error you are going to have a bad time.

Many promise libraries try to ameliorate this problem for you
by providing a `done` handler that simply handles any uncaught
errors.  The rule of thumb is this:

> If you are **not** returning a value from your promise to a caller,
> then attach a `done` handler to guard against uncaught exceptions.

An example is shown below:

```js
doStuff()
.then(doMoreStuff)
.then(null, complainAboutJavascript)
.done();
```

# Can you do what Async.js does?

When doing asynchronous programming you will often want to perform multiple
operations in parallel. In some cases you may wish to delay further processing
until a list of async operations have completed.

In synchronous code this is trivial because our operations are executed in the
order they are specified:

```js
var thingOne = getThing(1);
var thingTwo = getThing(2);

combine(thingOne, thingTwo);
```

We would like to build a function such that we can specify a list of
asynchronous values we would like to fetch and then use once all are
available.

```js
getAll(fetch(1), fetch(2))
  .then(function (values) {
    console.log(values[0], values[1]);
  });
```

# Let's do something, you know, from "real life"

**Let's fetch JSON over HTTP… YAY!**

Fetching JSON data from remote machines via AJAX is commonplace
on both the server and client.  Promises also happen to map to AJAX
particularly well.  Any AJAX request may either succeed or fail,
never both.  Promises may fulfill or reject, never both.

So wow.  Much similarity.  Very promising…

Let's use a new module called `q-io` to take advantage of its `http.read`
method which returns a promise for the value of a successful HTTP response
body.

Install by typing:

```sh
$ npm install q-io --save
```


# Let's do several operations against "remote" machines

Sending and fetching data from computers/processes other than your
application is an increasingly common task in the world of Node.js
and the browser.  Many times, you will need to gather data from
several sources, perform operations on it, and send some data back out.
