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

  describe(".all", () => {
    test("should resolve an array of promises and retain order", () => {
      expect.assertions(1);

      MyPromise.all([
        MyPromise.resolve(1),
        MyPromise.resolve(2),
        MyPromise.resolve(3)
      ]).then(val => expect(val).toMatchObject([1, 2, 3]));
    });

    test("should error on any error", () => {
      expect.assertions(1);

      MyPromise.all([
        MyPromise.resolve(1),
        MyPromise.reject<number>("Failure"),
        MyPromise.resolve(3)
      ]).then((_, err) => expect(err).toBe("Failure"));
    });
  });

  describe("constructor", () => {
    test("should create a Promise immediately resolved to a value", () => {
      expect.assertions(1);

      new MyPromise(resolve => resolve(5)).then(val => expect(val).toBe(5));
    });

    test("should create a Promise immediately errored to a message", () => {
      expect.assertions(1);

      new MyPromise((_, reject) => reject("Failure")).then((_, err) =>
        expect(err).toBe("Failure")
      );
    });
  });

  describe(".prototype.then", () => {
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

  describe(".prototype.catch", () => {
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

    test("should recover from error with chain to promise", () => {
      MyPromise.reject("Failure")
        .catch(() => MyPromise.resolve(5))
        .then(val => expect(val).toBe(5));
    });
  });
});
