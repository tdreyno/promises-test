# Promises

## Javascript

Synchonous, single-threaded programming language. Execution cannot be paused.

## Common Problem

1. Load 2 endpoints (async).
2. Parse data into JSON. (async).
3. Render HTML with React (async).

## Callbacks

Pass function closed over local scope as a reference to be called by low-level sytems (`XMLHttpRequest`, `fs.readFile`, etc).

```javascript
import parseJSON from "json-parser";

function loadEndpoint(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.onload = callback;
  xhr.send();
}

function renderToString([users, articles], callback) {
  React.render(
    <App users={users} articles={articles} />,
    document.body,
    callback
  );
}

loadEndpoint("/users", usersResult => {
  // Handle HTTP error?

  parseJSON(usersResult, users => {
    // Handle JSON parse error?

    loadEndpoint("/articles", articlesResult => {
      // Handle HTTP error?

      parseJSON(articlesResult, articles => {
        // Handle JSON parse error?

        renderToString([users, articles], html => {
          console.log("Rendered page", html);
        });
      });
    });
  });
});
```

### Problems

1. Deep nesting. Callback hell.
2. How do we do error handling? Retry logic?
3. How do we abstract? What if we want an arbitrary number of endpoints to return?
4. How do we run in parallel?
5. What if two pieces of the app need the same endpoint request? How do we avoid requesting it twice?

## Promises

A class instance which will eventually contain a value or error and will call callbacks when the value is present.

The class instance is a VALUE. It can be passed around to functions. Multiple pieces of code can attach their own callbacks.

```javascript
const iPromiseToGetUsers = fetch("/users");

// Javascript cannot pause execution, so we still don't have users, we need a callback.
iPromiseToGetUsers.then((users, error) => {
  // Get the result
  if (error) {
    console.error(error);
  } else {
    console.log(users);
  }
});
```

### States

Promises are a black box which may contain either nothing, a value or an error.

- pending
- resolved with value
- rejected with error

### Chaining

- Promise can be chained so that they run in sequence.
- Errors will bubble up to the top.
- `Promise.all` turns multiple promises into a single one which returns all results or fails on any error.

```javascript
function renderToString([users, articles]) {
  return new Promise(resolve => {
    React.render(
      <App users={users} articles={articles} />,
      document.body,
      resolve
    );
  });
}

const iPromiseToLoadAndParseUsers = fetch("/users")
  .then(usersResult => usersResult.json())
  .catch(err => console.log("Error loading users", error));

// Currently running, but not complete.

const iPromiseToLoadAndParseArticles = fetch("/articles")
  .then(articlesResult => articlesResult.json())
  .catch(err => console.log("Error loading articles", error));

// Currently running, but not complete.

const iPromiseToLoadAndParseUsersAndArticles = Promise.all([
  iPromiseToLoadAndParseUsers,
  iPromiseToLoadAndParseArticles
]);

// Currently running, but not complete.

iPromiseToLoadAndParseUsersAndArticles.then(renderToString).then(html => {
  console.log("Rendered page", html);
});
```

### Solved Problems

#### Deep nesting. Callback hell.

Chaining avoids deep nesting.

#### How do we do error handling? Retry logic?

Either by using the second argument to the `then` callback or with a `catch`. Because of chaining, if either of these returns a new Promise (such as retrying the request) it will continue the chain.

#### How do we abstract? What if we want an arbitrary number of endpoints to return?

We can write functions which return promises.

#### How do we run in parallel?

`Promise.all` waits for multiple promises to finish in parallel.

#### What if two pieces of the app need the same endpoint request? How do we avoid requesting it twice?

Pass each piece of the app the same promise so they can add their own `then` callback.

### New Problems

1. Promises start running as soon as you create them.
2. Promises cannot be cancelled.
3. Still involves callbacks. Must always remember that in imperitive code the promises are "Currently running, but not complete."
4. Getting the value REQUIRES `then`, you cannot get it from the promise value.

## Code Time!

Let's write some complicated async code.

Load a Github-like page's data.

There are Users with have Projects. Users also have Friends. Those Friends have Projects. There are also global Notifications.

Load all the Projects that the User can access (both theirs and their friends) and load the notifications.

## Stretch goal?

### Let's build our own

```typescript
abstract class OurPromise<T> {
  constructor(
    fn: (resolver: (value: T) => void, reject: (error: any) => void) => void
  ) {}

  abstract then<R>(
    callback: (value: T, error: any) => R | ThisType<R>
  ): ThisType<R>;

  abstract catch<R>(callback: (error: any) => R | ThisType<R>): ThisType<T | R>;
}
```

## async/await

Syntatic sugar which compiles to Promises to make Promises appear imperative and synchronous. Uses traditional `try/catch` for error handling.

```javascript
// `await` MUST be inside an `async` function.
// Work around IIFE (Immediately Invoked Function Expression)
(async function() {
  try {
    const users = await fetch("/users").then(usersResult => usersResult.json());

    // Or:
    // const usersResult = await fetch("/users");
    // const users = await usersResult.json();

    // Finished running. Can read users.

    const articles = await fetch("/articles").then(articlesResult =>
      articlesResult.json()
    );

    // Or:
    // const articlesResult = await fetch("/articles");
    // const articles = await articlesResult.json();

    // Finished running. Can read articles.

    const html = await renderToString([users, articles]);
    console.log("Rendered page", html);
  } catch (err) {
    console.error(err);
  }
})();
```

### Resolved Problems

#### Still involves callbacks. Must always remember that in imperitive code the promises are "Currently running, but not complete."

Code that is written after an `await` will have access to the values and never know about the promise.

### Getting the value REQUIRES `then`, you cannot get it from the promise value.

Ditto.

### New Problems

1. No longer parallel.
2. IIFE is awkward.

```javascript
(async function() {
  try {
    const usersAndArticles = await Promise.all([
      fetch("/users").then(usersResult => usersResult.json()),
      fetch("/articles").then(articlesResult => articlesResult.json())
    ]);

    // Finished running. Can read users and articles.

    const html = await renderToString(usersAndArticles);
    console.log("Rendered page", html);
  } catch (err) {
    console.error(err);
  }
})();
```

### Resolved Problems

#### No longer parallel.

Uses `Promise.all` to await on promises in parallel.

## Final Problems

1. Promises start running as soon as you create them.
2. Promises cannot be cancelled.
3. IIFE is awkward.
4. `await` will work on both Promises AND values.
5. `then`, `catch` and `Promise.all` intermingle with `async/await` and `try/catch` resulting in unclear code paths.
6. Many programmers will not use `Promise.all` to make the code reads more imperatively, losing parallel performance.
7. Making a function `async` make it automatically return a Promise, which means any code that uses that function then needs to become `async` as well. Failure to follow this chain will result in code that formerly had a value, now having a promise and as we know the Promise will be "Currently running, but not complete.".

## Solutions from other Languages

Instead of promises, Rust uses `Futures` and Elm uses `Tasks`.

Both are lazy. That is they do not run until requested. You could make a Future for a piece of data, but if the page never uses it, it won't be requested.

Both are cancellable. If you change pages while loading, you can stop loading the data you no longer need.

Both force the programmer to recognize when they are working with async and not assume imperative functionality.

Rust is adding async/await sugar to Futures this year. Elm will likely not as they are not a imperative language.

## My Tasks Implementation

http://github.com/tdreyno/pretty-please

```javascript
import { toJSON, HTTP, Task } from "@tdreyno/pretty-please";

function renderToString([users, articles]) {
  // Tasks always handle errors first.
  return new Task((reject, resolve) => {
    try {
      React.render(
        <App users={users} articles={articles} />,
        document.body,
        resolve
      );
    } catch (e) {
      reject(e);
    }
  });
}

// When eventually run, will be in parallel.
const getUsersAndArticlesPrettyPlease = Task.all([
  HTTP.get("/users").andThen(toJSON),
  HTTP.get("/articles").andThen(toJSON)
]).andThen(renderToString);

// Has not even started loading yet.

getUsersAndArticlesPrettyPlease.fork(
  err => console.error(err),
  html => console.log("Rendered page", html)
);
```

## Thanks
