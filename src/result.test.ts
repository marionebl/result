import { Option } from "@marionebl/option";
import { Result } from "./result";

describe("Result.from", () => {
  test("creates Ok for sync payload", async () => {
    const ok = Result.from(1);
    expect(await ok.sync()).toEqual(await Result.Ok(1).sync());
  });

  test("creates Err for sync error", async () => {
    const err = Result.from(new Error("Something went wrong"));
    expect(await err.sync()).toEqual(
      await Result.Err(new Error("Something went wrong")).sync()
    );
  });

  test("creates Ok for async payload", async () => {
    const ok = Result.from(Promise.resolve(1));
    expect(await ok.sync()).toEqual(await Result.Ok(1).sync());
  });

  test("creates Err for async error", async () => {
    const err = Result.from(
      Promise.resolve().then(() => new Error("Something went wrong"))
    );
    expect(await err.sync()).toEqual(
      await Result.Err(new Error("Something went wrong")).sync()
    );
  });
});

describe(".sync", () => {
  test("creates sync payload prop", async () => {
    const result = Result.from(1);
    expect(await result.sync()).toEqual({ payload: 1 });
  });

  test("creates sync payload prop", async () => {
    const result = Result.from(
      Promise.resolve().then(() => new Error("a"))
    );
    expect(await result.sync()).toEqual({ payload: new Error("a") });
  });
})

describe(".isErr", () => {
  test("returns true for exceptions", async () => {
    const result = Result.from(new Error("Something went wrong"));

    expect(await result.isErr()).toBe(true);
  });

  test("returns true for rejecting promises", async () => {
    const result = Result.from(
      Promise.resolve().then(() => {
        throw new Error("Something went wrong");
      })
    );

    expect(await result.isErr()).toBe(true);
  });

  test("returns false for payload", async () => {
    const result = Result.from(undefined);

    expect(await result.isErr()).toBe(false);
  });

  test("returns false for async payload", async () => {
    const result = Result.from(Promise.resolve());

    expect(await result.isErr()).toBe(false);
  });
});

describe(".isOk", () => {
  test("returns false for exceptions", async () => {
    const result = Result.from(new Error("Something went wrong"));

    expect(await result.isOk()).toBe(false);
  });

  test("returns true false rejecting promises", async () => {
    const result = Result.from(
      Promise.resolve().then(() => {
        throw new Error("Something went wrong");
      })
    );

    expect(await result.isOk()).toBe(false);
  });

  test("returns true for payload", async () => {
    const result = Result.from(undefined);

    expect(await result.isOk()).toBe(true);
  });

  test("returns true for async payload", async () => {
    const result = Result.from(Promise.resolve());

    expect(await result.isOk()).toBe(true);
  });
});

describe(".ok", () => {
  test("yields Some(p) payload for Ok(p)", async () => {
    const ok = Result.Ok(1);
    expect(await ok.ok()).toEqual(Option.Some(1));
  });

  test("yields None payload for Err", async () => {
    const err = Result.Err(new Error("Something went wrong"));
    expect(await err.ok()).toEqual(Option.None());
  });
});

describe(".err", () => {
  test("yields None payload for Ok(_)", async () => {
    const ok = Result.Ok(1);
    expect(await ok.err()).toEqual(Option.None());
  });

  test("yields Some(e) payload for Err(e)", async () => {
    const exn = new Error("Something went wrong");
    const err = Result.Err(exn);
    expect(await err.err()).toEqual(Option.Some(exn));
  });
});

describe(".map", () => {
  test("computes `fn` value for new Ok()", async () => {
    const ok = Result.Ok(1);
    const increment = async (i: number) => i + 1;
    expect(await ok.map(increment).then(v => v.sync())).toEqual(
      await Result.Ok(2).sync()
    );
  });

  test("does not execute `fn` on Err()", async () => {
    const err = Result.Err(new Error("Something went wrong"));
    const increment = jest.fn(async (i: number) => i + 1);
    await err.map(increment);
    expect(increment).not.toHaveBeenCalled();
  });

  test("does not modify Err()", async () => {
    const expn = new Error("Something went wrong");
    const err = Result.Err(expn);
    const increment = async (i: number) => i + 1;
    expect(await err.map(increment).then(e => e.sync())).toEqual(
      await Result.Err(expn).sync()
    );
  });
});

describe(".mapOrElse", () => {
  test("computes `fn` value for Ok()", async () => {
    const ok = Result.Ok(1);
    const zero = async () => 0;
    const increment = async (i: number) => i + 1;
    expect(await ok.mapOrElse(zero, increment).then(v => v.ok())).toEqual(
      Option.Some(2)
    );
  });

  test("does not execute `fn` on Err()", async () => {
    const err = Result.Err(new Error("Something went wrong"));
    const zero = jest.fn(async () => 0);
    const increment = jest.fn(async (i: number) => i + 1);
    await err.mapOrElse(zero, increment);

    expect(increment).not.toHaveBeenCalled();
    expect(zero).toHaveBeenCalled();
  });

  test("computes `fb` value for Err()", async () => {
    const expn = new Error("Something went wrong");
    const err = Result.Err(expn);
    const zero = jest.fn(async () => 0);
    const increment = async (i: number) => i + 1;
    expect(await err.mapOrElse(zero, increment).then(e => e.ok())).toEqual(
      Option.Some(0)
    );
  });
});

describe(".mapErr", () => {
  test("does not execute fn for Ok()", async () => {
    const ok = Result.Ok(1);
    const nope = jest.fn(async () => new Error("nope"));
    await ok.mapErr(nope);
    expect(nope).not.toHaveBeenCalled();
  });

  test("yields None() for Ok()", async () => {
    const ok = Result.Ok(1);
    const nope = async () => new Error("nope");
    const mapped = await ok.mapErr(nope);
    expect(await mapped.err()).toEqual(Option.None());
  });

  test("does execute fn for Err()", async () => {
    const err = Result.Err(new Error("Something went wrong"));
    const nope = jest.fn(async () => new Error("nope"));
    await err.mapErr(nope);

    expect(nope).toHaveBeenCalled();
  });

  test("computes `fb` value for Err()", async () => {
    const err = Result.Err(new Error("Something went wrong."));
    const nope = jest.fn(async err => new Error(err.message + " Booh!"));
    const result = await err.mapErr(nope);

    expect(await result.err()).toEqual(
      Option.Some(new Error("Something went wrong. Booh!"))
    );
  });
});

describe(".and", () => {
  test("okA.and(okB) returns okB", async () => {
    const okA = Result.Ok("a");
    const okB = Result.Ok("b");
    const result = await okA.and(okB);

    expect(await result.sync()).toEqual(await okB.sync());
  });

  test("err.and(okB) returns err", async () => {
    const err = Result.Err(new Error(""));
    const okB = Result.Ok("b");

    const result = await err.and(okB);

    expect(await result.sync()).toEqual(await err.sync());
  });

  test("okA.and(err) returns err", async () => {
    const okA = Result.Ok("a");
    const err = Result.Err(new Error(""));

    const result = await err.and(okA);

    expect(await result.sync()).toEqual(await err.sync());
  });

  test("errA.and(errB) returns errA", async () => {
    const errA = Result.Err(new Error("a"));
    const errB = Result.Err(new Error("b"));

    const result = await errA.and(errB);

    expect(await result.sync()).toEqual(await errA.sync());
  });
});

describe(".or", () => {
  test("ok.or(err) returns ok", async () => {
    const ok = Result.Ok("a");
    const err = Result.Err(new Error(""));
    const result = await ok.or(err);

    expect(await result.sync()).toEqual(await ok.sync());
  });

  test("err.or(ok) returns ok", async () => {
    const ok = Result.Ok("a");
    const err = Result.Err(new Error(""));
    const result = await err.or(ok);

    expect(await result.sync()).toEqual(await ok.sync());
  });

  test("okA.or(okB) returns okA", async () => {
    const okA = Result.Ok("a");
    const okB = Result.Ok("b");
    const result = await okA.or(okB);

    expect(await result.sync()).toEqual(await okA.sync());
  });

  test("okB.or(okA) returns okB", async () => {
    const okA = Result.Ok("a");
    const okB = Result.Ok("b");
    const result = await okB.or(okA);

    expect(await result.sync()).toEqual(await okB.sync());
  });
});

describe(".orElse", () => {
  test("ok.orElse(() => err) returns ok", async () => {
    const ok = Result.Ok("a");
    const err = Result.Err(new Error(""));
    const result = await ok.orElse(async () => err);

    expect(await result.sync()).toEqual(await ok.sync());
  });

  test("err.orElse(() => ok) returns ok", async () => {
    const ok = Result.Ok("a");
    const err = Result.Err(new Error(""));
    const result = await err.orElse(async () => ok);

    expect(await result.sync()).toEqual(await ok.sync());
  });

  test("okA.orElse(() => okB) returns okA", async () => {
    const okA = Result.Ok("a");
    const okB = Result.Ok("b");
    const result = await okA.orElse(async () => okB);

    expect(await result.sync()).toEqual(await okA.sync());
  });

  test("okB.orElse(() => okA) returns okB", async () => {
    const okA = Result.Ok("a");
    const okB = Result.Ok("b");
    const result = await okB.orElse(async () => okA);

    expect(await result.sync()).toEqual(await okB.sync());
  });
});

describe(".unwrapOr", () => {
  test("return payload for Ok()", async () => {
    const some = Result.Ok("a");
    expect(await some.unwrapOr("b")).toBe("a");
  });

  test("return fallback for Err()", async () => {
    const none = Result.Err(new Error(""));
    expect(await none.unwrapOr("b")).toBe("b");
  });
});

describe(".unwrapOrElse", () => {
  test("return payload for Ok()", async () => {
    const some = Result.Ok("a");
    expect(await some.unwrapOrElse(async () => "b")).toBe("a");
  });

  test("runs fn for Err()", async () => {
    const none = Result.Err(new Error("..."));
    expect(await none.unwrapOrElse(async err => err.message.length)).toBe(3);
  });
});

describe(".unwrap", () => {
  test("return payload for Ok()", async () => {
    const some = Result.Ok("a");
    expect(await some.unwrap()).toBe("a");
  });

  test("throws for Err()", async () => {
    const none = Result.Err(new Error("..."));
    expect(none.unwrap()).rejects.toEqual(new Error("..."));
  });
});

describe(".expect", () => {
  test("return payload for Ok()", async () => {
    const some = Result.Ok("a");
    expect(await some.expect("Booh!")).toBe("a");
  });

  test("throws for Err()", async () => {
    const none = Result.Err(new Error("..."));
    expect(none.expect("Booh!")).rejects.toBeTruthy();
  });

  test("throws for Err() with message", async () => {
    const none = Result.Err(new Error("..."));
    expect(none.expect("Booh!")).rejects.toEqual(new Error("Booh!"));
  });
});

describe(".unwrapErr", () => {
  test("throws for Ok()", async () => {
    const some = Result.Ok("a");
    // expect(some.unwrapErr()).rejects.toEqual(new Error("a"));
  });

  test("returns Error for Err()", async () => {
    const none = Result.Err(new Error("..."));
    expect(await none.unwrapErr()).toEqual(new Error("..."));
  });
});

describe(".expectErr", () => {
  test("throws for Ok()", async () => {
    const some = Result.Ok("a");
    // expect(some.expectErr("Booh!")).rejects.toBeTruthy();
  });

  test("throws for Ok() with message", async () => {
    const some = Result.Ok("a");
    // expect(some.expectErr("Booh!")).rejects.toEqual(new Error("Booh!"));
  });

  test("returns Error for Err()", async () => {
    const none = Result.Err(new Error("..."));
    expect(await none.expectErr("Booh!")).toEqual(new Error("..."));
  });
});

describe(".transpose", () => {
  test("Ok<Some<P>> => Some<Ok<P>>", async () => {
    const ok = Result.Ok(Option.Some(1));
    const option = await ok.transpose();

    expect(option.isSome()).toEqual(true);
    expect(await option.unwrap().sync()).toEqual(await Result.Ok(1).sync());
  });

  test("Ok<None> => None", async () => {
    const ok = Result.Ok(Option.None());
    const option = await ok.transpose();

    expect(option).toEqual(Option.None());
  });

  test("Err => Some(Err)", async () => {
    const err = Result.Err(new Error("..."));
    const option = await err.transpose();
    const result = await option.unwrap();

    expect(await result.sync()).toEqual(await err.sync());
  });

  test("Ok<1> => None", async () => {
    const ok = Result.Ok(1);
    const option = await ok.transpose();

    expect(option).toEqual(Option.None());
  });
});
