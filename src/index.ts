abstract class OurPromise<T> {
  constructor(
    fn: (resolver: (value: T) => void, rejecter: (error: any) => void) => void
  ) {}

  abstract then<R>(
    callback: (value: T, error: any) => R | ThisType<R>
  ): ThisType<R>;

  abstract catch<R>(callback: (error: any) => R | ThisType<R>): ThisType<T | R>;
}

class MyPromise<T> extends OurPromise<T> {
  // Possible results of the promise.
  protected value = undefined;
  protected error = undefined;

  // Our current state.
  protected state = "pending"; // Or resolved or rejected.

  // Subscribed callbacks.
  protected resolveSubscribers: Array<(value: T, error: any) => void> = [];
  protected rejectSubscribers: Array<(error: any) => void> = [];

  // Controls for how code will resolve or reject this promise.
  constructor(
    fn: (resolver: (value: T) => void, rejecter: (error: any) => void) => void
  ) {
    super(fn);

    fn(this.resolve, this.reject);
  }

  // Resolving sets the value, the state and calls the callbacks.
  protected resolve(val: T) {
    this.value = val;
    this.state = "resolved";

    this.resolveSubscribers.forEach(s => s(this.value, undefined));
    this.resolveSubscribers.length = 0;
  }

  // Resolving sets the error, the state and calls the callbacks.
  protected reject(err: any) {
    this.error = err;
    this.state = "rejected";

    this.resolveSubscribers.forEach(s => s(undefined, err));
    this.resolveSubscribers.length = 0;

    this.rejectSubscribers.forEach(s => s(err));
    this.rejectSubscribers.length = 0;
  }

  // Then subscribes to pending states or executes immediately if the promise has finished.
  public then<R>(
    callback: (value: T, error: any) => R | MyPromise<R>
  ): MyPromise<R> {
    const promise = new MyPromise<R>((resolve, reject) =>
      this.resolveSubscribers.push((value: T, error) => {
        const result = callback(value, error);

        if (result instanceof MyPromise) {
          result.then((val, err) => {
            if (err) {
              reject(err);
            } else {
              resolve(val);
            }
          });
        } else {
          resolve(result);
        }
      })
    );

    switch (this.state) {
      case "resolved":
        this.resolve(this.value);

      case "rejected":
        this.reject(this.error);

      case "pending":
        return promise;
    }
  }

  public catch<R>(
    callback: (error: any) => R | MyPromise<R>
  ): MyPromise<T | R> {
    switch (this.state) {
      case "resolved":
        return this;

      case "rejected": {
        const result = callback(this.error);

        if (result instanceof MyPromise) {
          return result;
        }

        return new MyPromise(r => r(result));
      }

      case "pending": {
        return new MyPromise((resolve, reject) =>
          this.rejectSubscribers.push(error => {
            const result = callback(error);

            if (result instanceof MyPromise) {
              result.then((val, err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(val);
                }
              });
            } else {
              resolve(result);
            }
          })
        );
      }
    }
  }
}
