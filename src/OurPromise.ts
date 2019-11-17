export abstract class OurPromise<T> {
  constructor(
    fn: (resolve: (value: T) => void, reject: (error: any) => void) => void
  ) {}

  abstract then<R>(
    callback: (value?: T, error?: any) => R | ThisType<R>
  ): ThisType<R>;

  abstract catch<R>(
    callback: (error: any) => T | R | ThisType<T | R>
  ): ThisType<T | R>;

  static all<T>(promises: ThisType<T>[]): ThisType<T[]> {
    throw new Error("Must implement static `all`");
  }

  static resolve<T>(val: T): ThisType<T> {
    throw new Error("Must implement static `resolve`");
  }

  static reject<T = void>(error: any): ThisType<T> {
    throw new Error("Must implement static `reject`");
  }
}
