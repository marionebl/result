import { Option, Some, None } from "@marionebl/option";

export interface Ok<Payload> {
  isErr(): Promise<false>;
  isOk(): Promise<true>;
  ok(): Promise<Some<Payload>>;
  unwrap(): Promise<Payload>;
  unwrapErr(): Promise<Error>;
}

export interface Err {
  isErr(): Promise<true>;
  isOk(): Promise<false>;
  ok(): Promise<None>;
  unwrap(): Promise<any>;
  unwrapErr(): Promise<Error>;
}

export class Result<Payload> {
  private payload?: Promise<Payload>;

  private constructor({ payload }: { payload: Payload }) {
    this.payload = Promise.resolve().then(() => payload);
  }

  public static from<Payload>(payload: Payload): Result<Payload> {
    return new Result({ payload });
  }

  public static Ok<Payload>(payload: Payload): Ok<Payload> {
    return new Result({ payload }) as Ok<Payload>;
  }

  public static Err(err: Error): Err {
    return new Result({ payload: err }) as Err;
  }

  /**
   * ```ts
   * async function doFail(): Result<unknown, Error> {
   *    const result = Result.from(new Error('Something went wrong.'));
   *
   *    if (await result.isErr()) {
   *      return result;
   *    }
   *
   *    return;
   * }
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
   * ```ts
   * async function doSucceed(): Result<unknown, Error> {
   *    const result = Result.from('Something succeeded');
   *
   *    if (await result.isOk()) {
   *      return result;
   *    }
   *
   *    return;
   * }
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

  public async ok(): Promise<Option<Payload>> {
    if (await this.isOk()) {
      return Option.Some(await this.payload!);
    }

    return Option.None();
  }

  public async unwrap(): Promise<Payload> {
    return await this.payload!;
  }

  public async unwrapErr(): Promise<Error> {
    try {
      const payload = await this.payload;
      throw new Error(String(payload));
    } catch (err) {
      return err;
    }
  }
}
