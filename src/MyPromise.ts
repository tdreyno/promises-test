import { OurPromise } from "./OurPromise";

export class MyPromise<T> extends OurPromise<T> {
  // Possible results of the promise.
  private value?: T;
  private error?: any;

  // Our current state.
  private state: "pending" | "resolved" | "rejected" = "pending"; // Or resolved or rejected.

  // Subscribed callbacks.
  private resolveSubscribers: Array<(value?: T, error?: any) => void> = [];
  private rejectSubscribers: Array<(error: any) => void> = [];

  static all<T>(promises: MyPromise<T>[]): MyPromise<T[]> {
    return new MyPromise((resolve, reject) => {
      const result: T[] = [];
      let hasErrored = false;
      let remainingPromises = promises.length;

      promises.forEach((promise, i) =>
        promise.then((value, error) => {
          if (hasErrored) {
            return;
          }

          if (error) {
            hasErrored = true;
            reject(error);
          } else {
            remainingPromises -= 1;
            result[i] = value;

            if (remainingPromises === 0) {
              resolve(result);
            }
          }
        })
      );
    });
  }

  static resolve<T>(val: T): MyPromise<T> {
    return new MyPromise<T>(resolve => resolve(val));
  }

  static reject<T = void>(error: any): MyPromise<T> {
    return new MyPromise<T>((_, reject) => reject(error));
  }

  // Controls for how code will resolve or reject this promise.
  constructor(
    fn: (resolve: (value: T) => void, reject: (error: any) => void) => void
  ) {
    super(fn);

    fn(this.resolve.bind(this), this.reject.bind(this));
  }

  // Resolving sets the value, the state and calls the callbacks.
  private resolve(val: T) {
    this.value = val;
    this.state = "resolved";

    this.resolveSubscribers.forEach(s => s(val, undefined));
    this.resolveSubscribers.length = 0;
  }

  // Resolving sets the error, the state and calls the callbacks.
  private reject(err: any) {
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
      this.resolveSubscribers.push((value, error) => {
        const result = callback(value!, error);

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
        this.resolve(this.value!);

      case "rejected":
        this.reject(this.error!);

      case "pending":
        return promise;
    }
  }

  public catch<R>(
    callback: (error: any) => R | MyPromise<R>
  ): MyPromise<T | R> {
    switch (this.state) {
      case "resolved":
        return MyPromise.resolve<T | R>(this.value!);

      case "rejected": {
        const result = callback(this.error);

        if (result instanceof MyPromise) {
          return result as MyPromise<T | R>;
        }

        return new MyPromise<T | R>(r => r(result));
      }

      case "pending": {
        return new MyPromise<T | R>((resolve, reject) =>
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
