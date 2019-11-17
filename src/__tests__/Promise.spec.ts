import { MyPromise } from "../MyPromise";

describe("MyPromise", () => {
  describe(".resolve", () => {
    test("should create a Promise immediately resolved to a value", () => {
      expect.assertions(1);

      MyPromise.resolve(5).then(val => expect(val).toBe(5));
    });
  });

  describe(".reject", () => {
    test("should create a Promise immediately errored to a message", () => {
      expect.assertions(1);

      MyPromise.reject("Failure").then((_, err) => expect(err).toBe("Failure"));
    });
  });

  describe("constructor", () => {
    test("should create a Promise immediately resolved to a value", () => {
      expect.assertions(1);

      new MyPromise(resolver => resolver(5)).then(val => expect(val).toBe(5));
    });

    test("should create a Promise immediately errored to a message", () => {
      expect.assertions(1);

      new MyPromise((_, rejecter) => rejecter("Failure")).then((_, err) =>
        expect(err).toBe("Failure")
      );
    });
  });

  describe("then", () => {
    test("should chain success to value", () => {
      MyPromise.resolve(5)
        .then(val => val * 2)
        .then(val => expect(val).toBe(10));
    });

    test("should recover from error with chain to value", () => {
      MyPromise.reject("Failure")
        .then(() => 5)
        .then(val => expect(val).toBe(5));
    });

    test("should chain success to promise", () => {
      MyPromise.resolve(5)
        .then(val => MyPromise.resolve(val * 2))
        .then(val => expect(val).toBe(10));
    });

    test("should recover from error with chain to value", () => {
      MyPromise.reject("Failure")
        .then(() => MyPromise.resolve(5))
        .then(val => expect(val).toBe(5));
    });
  });

  describe("catch", () => {
    test("should not run on success", () => {
      const catcher = jest.fn();

      MyPromise.resolve(5).catch(() => catcher());

      expect(catcher).not.toBeCalled();
    });

    test("should recover from error with chain to value", () => {
      MyPromise.reject("Failure")
        .catch(() => 5)
        .then(val => expect(val).toBe(5));
    });

    test("should recover from error with chain to value", () => {
      MyPromise.reject("Failure")
        .catch(() => MyPromise.resolve(5))
        .then((val: any) => expect(val).toBe(5));
    });
  });
});
