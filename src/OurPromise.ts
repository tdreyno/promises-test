export abstract class OurPromise<T> {
  constructor(
    fn: (resolver: (value: T) => void, rejecter: (error: any) => void) => void
  ) {}

  then<R>(callback: (value?: T, error?: any) => R | ThisType<R>): ThisType<R> {
    throw new Error("Must implement `then`");
  }

  catch<R>(callback: (error: any) => T | R | ThisType<T | R>): ThisType<T | R> {
    throw new Error("Must implement `catch`");
  }

  static resolve<T>(val: T): ThisType<T> {
    throw new Error("Must implement static `resolve`");
  }

  static reject<T = void>(error: any): ThisType<T> {
    throw new Error("Must implement static `reject`");
  }
}
