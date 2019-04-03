import { Option, Some, None } from "@marionebl/option";

export interface Ok<Payload> {
  sync(): Promise<Ok<Payload>>;

  isErr(): Promise<false>;
  isOk(): Promise<true>;
  ok(): Promise<Some<Payload>>;
  err(): Promise<None>;
  map<V>(fn: (v: Payload) => Promise<V>): Promise<Ok<V>>;
  mapOrElse<V>(
    fb: () => Promise<V>,
    fn: (v: Payload) => Promise<V>
  ): Promise<Ok<V>>;
  mapErr(fn: (err: Error) => Promise<Error>): Promise<Result<Payload>>;

  and<T>(b: Err): Promise<Err>;
  and<T>(b: Ok<T>): Promise<Result<Payload | T>>;
  and<T>(b: Result<T>): Promise<Result<Payload | T>>;

  or<T extends Result<V>, V>(b: T): Promise<this | T>;
  orElse<T extends Result<V>, V>(fn: () => Promise<T>): Promise<this | T>;

  unwrapOr<T>(b: T): Promise<T | Payload>;
  unwrapOrElse<T>(fn: (err: Error) => Promise<T>): Promise<T | Payload>;

  unwrap(): Promise<Payload>;
  expect(message: string): Promise<Payload>;

  unwrapErr(): Promise<Error>;
  expectErr(message: string): Promise<Error>;

  transpose(): Promise<Option<Result<Payload>>>;
}

export interface Err {
  sync(): Promise<Err>;

  isErr(): Promise<true>;
  isOk(): Promise<false>;
  ok(): Promise<None>;
  err(): Promise<Some<Error>>;

  map<V>(fn: (v: any) => Promise<V>): Promise<Err>;
  mapOrElse<V>(
    fb: () => Promise<V>,
    fn: (v: any) => Promise<V>
  ): Promise<Ok<V>>;
  mapErr(fn: (err: Error) => Promise<Error>): Promise<Err>;

  and<T>(b: Result<T>): Promise<Err>;
  or<T extends Result<V>, V>(b: T): Promise<T>;
  orElse<T extends Result<V>, V>(fn: () => Promise<T>): Promise<T>;

  unwrapOr<T>(b: T): Promise<T>;
  unwrapOrElse<T>(fn: (err: Error) => Promise<T>): Promise<T>;

  unwrap(): Promise<any>;
  expect(message: string): Promise<any>;

  unwrapErr(): Promise<Error>;
  expectErr(message: string): Promise<Error>;

  transpose(): Promise<None>;
}

export class Result<Payload> {
  private payload?: Promise<Payload> | Payload;

  private constructor({ payload }: { payload: Payload }) {
    this.payload = Promise.resolve().then(() => payload);
  }

  public async sync(): Promise<Result<Payload>> {
    try {
      this.payload = await this.payload;
    
    } catch (err) {
      this.payload = err;
    }

    return this;
  }

  /**
   * Create a `Result` from an unknown `input` payload or `Error`
   * * `Error` yields `Err(Error)`
   * * `any` yields `Ok(any)`
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *   const ok = Result.from(1);
   *   const asyncOk = Result.from(Promise.resolve(1));
   *
   *   const exn = new Error("Something went wrong");
   *   const err = Result.from(exn);
   *   const asyncErr = Result.from(Promise.resolve().then(() => exn));
   *
   *   assert.strictEqual(await ok, await Result.Ok(1));
   *   assert.strictEqual(await asyncOk, await Result.Ok(1));
   *
   *   assert.strictEqual(await err, await Result.Err(exn));
   *   assert.strictEqual(await asyncErr, await Result.Err(exn));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   *
   */
  public static from<Payload>(payload: Payload): Result<Payload> {
    return new Result({ payload });
  }

  /**
   * Create an `Ok` from `any` payload
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *   const ok = Result.Ok(1);
   *   const asyncOk = Result.Ok(Promise.resolve(1));
   *
   *   assert.strictEqual(await ok, await Result.Ok(1));
   *   assert.strictEqual(await asyncOk, await Result.Ok(1));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public static Ok<Payload>(payload: Payload): Ok<Payload> {
    return new Result({ payload }) as Ok<Payload>;
  }

  /**
   * Create an `Err` from an `Error`
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *   const exn = new Error("Something went wrong");
   *   const err = Result.from(exn);
   *   const asyncErr = Result.from(Promise.resolve().then(() => exn));
   *
   *   assert.strictEqual(await err, await Result.Err(exn));
   *   assert.strictEqual(await asyncErr, await Result.Err(exn));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public static Err(err: Error): Err {
    return new Result({ payload: err }) as Err;
  }

  /**
   * Returns true if the result is `Err`.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const err = Result.Err(new Error('Something went wrong.'));
   *
   *  assert.ok(!(await ok.isErr()));
   *  assert.ok(await ok.isOk());
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async isErr(): Promise<boolean> {
    try {
      const content = await this.payload;
      return content instanceof Error;
    } catch (err) {
      return true;
    }
  }

  /**
   * Returns true if the result is `Ok`.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const err = Result.Err(new Error('Something went wrong.'));
   *
   *  assert.ok(await ok.isErr());
   *  assert.ok(!(await ok.isOk()));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async isOk(): Promise<boolean> {
    try {
      const content = await this.payload;
      return !(content instanceof Error);
    } catch (err) {
      return false;
    }
  }

  /**
   * Converts from `Result<T>` to `Option<T>`.
   *
   * Converts into an `Option<T>`, and discarding the error, if any.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const err = Result.Err(new Error('Something went wrong.'));
   *
   *  assert.strictDeepEqual(await ok.ok(), Option.Some(1));
   *  assert.strictDeepEqual(await err.ok(), Option.None());
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async ok(): Promise<Option<Payload>> {
    if (await this.isOk()) {
      return Option.Some(await this.payload!);
    }

    return Option.None();
  }

  /**
   * Converts from `Result<T>` to `Option<T>`.
   *
   * Converts into an `Option<T>`, and discarding the success value, if any.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const err = Result.Err(new Error('Something went wrong.'));
   *
   *  assert.strictDeepEqual(await ok.ok(), Option.Some(1));
   *  assert.strictDeepEqual(await err.ok(), Option.None());
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async err(): Promise<Option<Error>> {
    try {
      const payload = await this.payload;
      return payload instanceof Error ? Option.Some(payload) : Option.None();
    } catch (err) {
      return Option.Some(err);
    }
  }

  /**
   * Maps a `Result<T>` to `Result<V>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const expn = new Error('Something went wrong.');
   *  const err = Result.Err(expn);
   *
   *  assert.strictDeepEqual(await ok.map(async i => i + 1).ok(), Option.Some(2));
   *  assert.strictDeepEqual(await err.map(async i => i + 1).err(), Option.Some(expn));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async map<V>(fn: (v: Payload) => Promise<V>): Promise<Ok<V> | Err> {
    if (await this.isOk()) {
      const payload = await this.payload;
      return Result.Ok(await fn(payload!));
    }

    return this as Err;
  }

  /**
   * Maps a `Result<T>` to `Result<V>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const expn = new Error('Something went wrong.');
   *  const err = Result.Err(expn);
   *
   *  assert.strictDeepEqual(await ok.mapOrElse(() => 0, async i => i + 1).ok(), Option.Some(2));
   *  assert.strictDeepEqual(await err.mapOrElse(() => 0, async i => i + 1).ok(), Option.Some(0));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async mapOrElse<V>(
    fallback: () => Promise<V>,
    fn: (v: Payload) => Promise<V>
  ): Promise<Ok<V>> {
    if (await this.isOk()) {
      const payload = await this.payload;
      return Result.Ok(await fn(payload!));
    }

    return Result.Ok(await fallback());
  }

  /**
   * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const ok = Result.Ok(1);
   *  const expn = new Error('Something went wrong.');
   *  const err = Result.Err(expn);
   *
   *  assert.strictDeepEqual(await ok.mapErr((err) => new Error(err.message + ' Booh!')).ok(), Option.Some(1));
   *  assert.strictDeepEqual(await err.mapErr(err) => new Error(err.message + ' Booh!')).err(), Option.Some(new Error('Something went wrong. Booh!')));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   */
  public async mapErr(
    fn: (err: Error) => Promise<Error>
  ): Promise<Result<Payload>> {
    if (await this.isErr()) {
      const payload = await this.payload;
      return Result.Err(await fn((payload as unknown) as Error));
    }

    return this;
  }

  /**
   * Returns `b` if the result is `Ok`, otherwise returns the `Err` value of self.
   *
   * ```ts
   * import * as assert from "assert";
   * import { Option } from "@marionebl/option";
   * import { Result } from "@marionebl/result";
   *
   * async function main() {
   *  const someA = Result.Ok('a');
   *  const someB = Result.Ok('b');
   *  const noneA = Result.Err(new Error('c'));
   *  const noneB = Result.Err(new Error('d'));
   *
   *  const someSome = await someA.and(someB);
   *  const someNone = await someA.and(noneA);
   *  const noneSome = await noneA.and(someA);
   *  const noneNone = await noneB.and(noneA);
   *
   *  assert.strictDeepEqual(await someSome.ok(), Option.Ok('b'));
   *  assert.strictDeepEqual(await someNone.err(), Result.Err(new Error('c')));
   *  assert.strictDeepEqual(await noneSome.err(), Result.Err(new Error('c')));
   *  assert.strictDeepEqual(await noneNone.err(), Result.Err(new Error('d')));
   * }
   *
   * main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async and<T>(b: Result<T>): Promise<Result<Payload | T>> {
    if (await this.isErr()) {
      return this;
    }

    if (await b.isErr()) {
      return b;
    }

    return b;
  }

  /**
   * Returns the success if it contains a value, otherwise returns `b`.
   *
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   {
   *     const ok = Result.Ok(2);
   *     const err = Result.Err(new Error(""));
   *     const result = await ok.or(err);
   *     assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
   *   }
   *  
   *   {
   *     const err = Result.Err(new Error(""));
   *     const ok = Result.Ok(2);
   *     const result = await err.or(ok);
   *     assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
   *   }
   *  
   *   {
   *     const a = Result.Ok(100);
   *     const b = Result.Ok(2);
   *     const result = await a.or(b);
   *     assert.deepStrictEqual(await result.sync(), await a.sync());
   *   }
   *  
   *   {
   *     const a = Result.Err(new Error(""));
   *     const b = Result.Err(new Error(""));
   *     const result = await a.or(b);
   *     assert.deepStrictEqual(await result.sync(), await Option.Err(new Error("")).sync());
   *   }
   * }
   * 
   *  main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async or<T extends Result<V>, V>(b: T): Promise<this | T> {
    if (await this.isOk()) {
      return this;
    }

    return b;
  }

  /**
   * Calls `fn` if the result is `Err`, otherwise returns the `Ok` value.
   *
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   {
   *     const ok = Result.Ok(2);
   *     const err = Result.Err(new Error(""));
   *     const result = await ok.orElse(async () => err);
   *     assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
   *   }
   *  
   *   {
   *     const err = Result.Err(new Error(""));
   *     const ok = Result.Ok(2);
   *     const result = await err.orElse(async () => ok);
   *     assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
   *   }
   *  
   *   {
   *     const a = Result.Ok(100);
   *     const b = Result.Ok(2);
   *     const result = await a.orElse(async () => b);
   *     assert.deepStrictEqual(await result.sync(), await a.sync());
   *   }
   *  
   *   {
   *     const a = Result.Err(new Error(""));
   *     const b = Result.Err(new Error(""));
   *     const result = await a.orElse(async () => b);
   *     assert.deepStrictEqual(await result.sync(), await Option.Err(new Error("")).sync());
   *   }
   * }
   * 
   *  main().catch((err) => {
   *   throw err
   * });
   * ```
   */
  public async orElse<T extends Result<V>, V>(fn: () => Promise<T>): Promise<this | T> {
    if (await this.isOk()) {
      return this;
    }

    return fn();
  }

  /**
   * Unwraps a result, yielding the content of an `Ok`. Else, it returns `b`.
   * 
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.strictEqual(await some.unwrapOr(2), 1);
   *  
   *   const none = Result.Err(new Error(""));
   *   assert.strictEqual(await none.unwrapOr(2), 2);
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async unwrapOr<T>(fallback: T): Promise<Payload | T> {
    if (await this.isErr()) {
      return fallback;
    }

    return this.payload!;
  }

  /**
   * Unwraps a result, yielding the content of an `Ok`. If the value is an `Err` then it calls `fn` with its value.
   * 
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.strictEqual(await some.unwrapOrElse(async () => 2), 1);
   *  
   *   const none = Result.Err(new Error("..."));
   *   assert.strictEqual(await none.unwrapOrElse(async (err) => err.message.length), 3);
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async unwrapOrElse<T>(fn: (p: Error) => Promise<T>): Promise<Payload | T> {
    if (await this.isErr()) {
      return fn(await this.payload! as unknown as Error);
    }

    return this.payload!;
  }

  /**
   * Unwraps a result, yielding the content of an `Ok`.
   * 
   * @throws Throws if the value is an `Err`, with a panic message provided by the `Err` value.
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.strictEqual(await some.unwrap(), 1);
   *  
   *   const none = Result.Err(new Error("..."));
   *   assert.rejects(async () => await none.unwrap(), new Error("..."));
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async unwrap(): Promise<Payload> {
    const payload = await this.payload!;

    if (payload instanceof Error) {
      throw payload;
    }

    return payload;
  }

  /**
   * Unwraps a result, yielding the content of an `Ok`.
   * 
   * @throws Throws if the value is an `Err`, with a panic message including the passed `message`, and the content of the `Err`.
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.strictEqual(await some.expect("Booh!"), 1);
   *  
   *   const none = Result.Err(new Error("..."));
   *   assert.rejects(async () => await none.expect("Booh!"), new Error("Booh!"));
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async expect(message: string): Promise<Payload> {
    try {
      const payload = await this.payload!;

      if (payload instanceof Error) {
        throw new Error(message);
      }

      return payload;
    } catch (err) {
      throw new Error(message);
    }
  }

  /**
   * Unwraps a result, yielding the content of an `Err`.
   * 
   * @throws Throws if the value is an `Ok`, with a panic message including the content of the `Ok`.
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.rejects(async () => await some.unwrapErr(), new Error("1"))
   *  
   *   const none = Result.Err(new Error("..."));
   *   assert.strictEqual(await none.unwrapErr(), new Error("..."));
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async unwrapErr(): Promise<Error> {
    try {
      const payload = await this.payload!;

      if (payload instanceof Error) {
        return payload;
      }

      throw new Error(String(payload));
    } catch (err) {
      return err;
    }
  }

  /**
   * Unwraps a result, yielding the content of an `Err`.
   * 
   * @throws Throws if the value is an `Ok`, with a panic message including the passed message, and the content of the `Ok`.
   * ```ts
   * import * as assert from 'assert';
   * import { Result } from '@marionebl/result';
   *
   * async function main() {
   *   const some = Result.Ok(1);
   *   assert.rejects(async () => await some.expectErr("Booh!"), new Error("Booh!"))
   *  
   *   const none = Result.Err(new Error("..."));
   *   assert.strictEqual(await none.expectErr("Booh!"), new Error("..."));
   * }
   * 
   * main().catch(err => {
   *   throw err;
   * });
   * ```
   */
  public async expectErr(message: string): Promise<Error> {
    try {
      const payload = await this.payload!;

      if (payload instanceof Error) {
        return payload;
      }

      throw new Error(message);
    } catch (err) {
      return err;
    }
  }

  public async transpose(): Promise<Option<Result<Payload>>> {
    try {
      const payload = await this.payload!;

      if (payload instanceof Option && payload.isSome()) {
        return Option.Some(Result.Ok(payload.unwrapOr(Option.None)));
      }

      if (payload instanceof Error) {
        return Option.Some(Result.Err(payload));
      }

      return Option.None();
    } catch (err) {
      return Option.Some(err);
    }
  }
}
