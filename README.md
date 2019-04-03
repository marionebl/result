> Rust Results for JavaScript

# @marionebl/result

[![][ci-badge]][ci-url] [![][npm-badge]][npm-url]

* Implements full [Rust Result API](https://doc.rust-lang.org/std/result/enum.Result.html)
* Narrow types for easy usage
* Extensive [documentation](#API)

---

## API

### Named Constructors

* [Err](#err-1)
* [Ok](#ok-1)
* [from](#from)

### Methods

* [and](#and)
* [err](#err)
* [expect](#expect)
* [expectErr](#expecterr)
* [isErr](#iserr)
* [isOk](#isok)
* [map](#map)
* [mapErr](#maperr)
* [mapOrElse](#maporelse)
* [ok](#ok)
* [or](#or)
* [orElse](#orelse)
* [sync](#sync)
* [transpose](#transpose)
* [unwrap](#unwrap)
* [unwrapErr](#unwraperr)
* [unwrapOr](#unwrapor)
* [unwrapOrElse](#unwraporelse)

---

## Named Constructors


___
<a id="err-1"></a>

### `<Static>` Err

▸ **Err**(err: *`Error`*): [Err](../interfaces/_result_.err.md)

*Defined in [result.ts:164](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L164)*

Create an `Err` from an `Error`

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
  const exn = new Error("Something went wrong");
  const err = Result.from(exn);
  const asyncErr = Result.from(Promise.resolve().then(() => exn));

  assert.strictEqual(await err, await Result.Err(exn));
  assert.strictEqual(await asyncErr, await Result.Err(exn));
}

main().catch((err) => {
  throw err
});
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| err | `Error` |

**Returns:** [Err](../interfaces/_result_.err.md)

___
<a id="ok-1"></a>

### `<Static>` Ok

▸ **Ok**<`Payload`>(payload: *`Payload`*): [Ok](../interfaces/_result_.ok.md)<`Payload`>

*Defined in [result.ts:139](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L139)*

Create an `Ok` from `any` payload

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
  const ok = Result.Ok(1);
  const asyncOk = Result.Ok(Promise.resolve(1));

  assert.strictEqual(await ok, await Result.Ok(1));
  assert.strictEqual(await asyncOk, await Result.Ok(1));
}

main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### Payload 
**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Payload` |

**Returns:** [Ok](../interfaces/_result_.ok.md)<`Payload`>

___
<a id="from"></a>

### `<Static>` from

▸ **from**<`Payload`>(payload: *`Payload`*): [Result]()<`Payload`>

*Defined in [result.ts:115](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L115)*

Create a `Result` from an unknown `input` payload or `Error`

*   `Error` yields `Err(Error)`
*   `any` yields `Ok(any)`

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
  const ok = Result.from(1);
  const asyncOk = Result.from(Promise.resolve(1));

  const exn = new Error("Something went wrong");
  const err = Result.from(exn);
  const asyncErr = Result.from(Promise.resolve().then(() => exn));

  assert.strictEqual(await ok, await Result.Ok(1));
  assert.strictEqual(await asyncOk, await Result.Ok(1));

  assert.strictEqual(await err, await Result.Err(exn));
  assert.strictEqual(await asyncErr, await Result.Err(exn));
}

main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### Payload 
**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Payload` |

**Returns:** [Result]()<`Payload`>

---

## Methods

<a id="and"></a>

###  and

▸ **and**<`T`>(b: *[Result]()<`T`>*): `Promise`<[Result]()<`Payload` \| `T`>>

*Defined in [result.ts:413](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L413)*

Returns `b` if the result is `Ok`, otherwise returns the `Err` value of self.

```ts
import * as assert from "assert";
import { Option } from "@marionebl/option";
import { Result } from "@marionebl/result";

async function main() {
 const someA = Result.Ok('a');
 const someB = Result.Ok('b');
 const noneA = Result.Err(new Error('c'));
 const noneB = Result.Err(new Error('d'));

 const someSome = await someA.and(someB);
 const someNone = await someA.and(noneA);
 const noneSome = await noneA.and(someA);
 const noneNone = await noneB.and(noneA);

 assert.strictDeepEqual(await someSome.ok(), Option.Ok('b'));
 assert.strictDeepEqual(await someNone.err(), Result.Err(new Error('c')));
 assert.strictDeepEqual(await noneSome.err(), Result.Err(new Error('c')));
 assert.strictDeepEqual(await noneNone.err(), Result.Err(new Error('d')));
}

main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| b | [Result]()<`T`> |

**Returns:** `Promise`<[Result]()<`Payload` \| `T`>>

___
<a id="err"></a>

###  err

▸ **err**(): `Promise`<`Option`<`Error`>>

*Defined in [result.ts:278](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L278)*

Converts from `Result<T>` to `Option<T>`.

Converts into an `Option<T>`, and discarding the success value, if any.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const err = Result.Err(new Error('Something went wrong.'));

 assert.strictDeepEqual(await ok.ok(), Option.Some(1));
 assert.strictDeepEqual(await err.ok(), Option.None());
}

main().catch((err) => {
  throw err
});
```

**Returns:** `Promise`<`Option`<`Error`>>

___
<a id="expect"></a>

###  expect

▸ **expect**(message: *`string`*): `Promise`<`Payload`>

*Defined in [result.ts:633](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L633)*

Unwraps a result, yielding the content of an `Ok`.

*__throws__*: Throws if the value is an `Err`, with a panic message including the passed `message`, and the content of the `Err`.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.strictEqual(await some.expect("Booh!"), 1);

  const none = Result.Err(new Error("..."));
  assert.rejects(async () => await none.expect("Booh!"), new Error("Booh!"));
}

main().catch(err => {
  throw err;
});
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |

**Returns:** `Promise`<`Payload`>

___
<a id="expecterr"></a>

###  expectErr

▸ **expectErr**(message: *`string`*): `Promise`<`Error`>

*Defined in [result.ts:703](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L703)*

Unwraps a result, yielding the content of an `Err`.

*__throws__*: Throws if the value is an `Ok`, with a panic message including the passed message, and the content of the `Ok`.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.rejects(async () => await some.expectErr("Booh!"), new Error("Booh!"))

  const none = Result.Err(new Error("..."));
  assert.strictEqual(await none.expectErr("Booh!"), new Error("..."));
}

main().catch(err => {
  throw err;
});
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `string` |

**Returns:** `Promise`<`Error`>

___
<a id="iserr"></a>

###  isErr

▸ **isErr**(): `Promise`<`boolean`>

*Defined in [result.ts:188](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L188)*

Returns true if the result is `Err`.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const err = Result.Err(new Error('Something went wrong.'));

 assert.ok(!(await ok.isErr()));
 assert.ok(await ok.isOk());
}

main().catch((err) => {
  throw err
});
```

**Returns:** `Promise`<`boolean`>

___
<a id="isok"></a>

###  isOk

▸ **isOk**(): `Promise`<`boolean`>

*Defined in [result.ts:217](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L217)*

Returns true if the result is `Ok`.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const err = Result.Err(new Error('Something went wrong.'));

 assert.ok(await ok.isErr());
 assert.ok(!(await ok.isOk()));
}

main().catch((err) => {
  throw err
});
```

**Returns:** `Promise`<`boolean`>

___
<a id="map"></a>

###  map

▸ **map**<`V`>(fn: *`function`*): `Promise`<[Ok](../interfaces/_result_.ok.md)<`V`> \| [Err](../interfaces/_result_.err.md)>

*Defined in [result.ts:308](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L308)*

Maps a `Result<T>` to `Result<V>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const expn = new Error('Something went wrong.');
 const err = Result.Err(expn);

 assert.strictDeepEqual(await ok.map(async i => i + 1).ok(), Option.Some(2));
 assert.strictDeepEqual(await err.map(async i => i + 1).err(), Option.Some(expn));
}

main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### V 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** `Promise`<[Ok](../interfaces/_result_.ok.md)<`V`> \| [Err](../interfaces/_result_.err.md)>

___
<a id="maperr"></a>

###  mapErr

▸ **mapErr**(fn: *`function`*): `Promise`<[Result]()<`Payload`>>

*Defined in [result.ts:372](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L372)*

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.

This function can be used to pass through a successful result while handling an error.

`` ` ``ts import \* as assert from "assert"; import { Result } from "@marionebl/result";

async function main() { const ok = Result.Ok(1); const expn = new Error('Something went wrong.'); const err = Result.Err(expn);

assert.strictDeepEqual(await ok.mapErr((err) => new Error(err.message + ' Booh!')).ok(), Option.Some(1)); assert.strictDeepEqual(await err.mapErr(err) => new Error(err.message + ' Booh!')).err(), Option.Some(new Error('Something went wrong. Booh!'))); }

main().catch((err) => { throw err });

**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** `Promise`<[Result]()<`Payload`>>

___
<a id="maporelse"></a>

###  mapOrElse

▸ **mapOrElse**<`V`>(fallback: *`function`*, fn: *`function`*): `Promise`<[Ok](../interfaces/_result_.ok.md)<`V`>>

*Defined in [result.ts:338](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L338)*

Maps a `Result<T>` to `Result<V>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const expn = new Error('Something went wrong.');
 const err = Result.Err(expn);

 assert.strictDeepEqual(await ok.mapOrElse(() => 0, async i => i + 1).ok(), Option.Some(2));
 assert.strictDeepEqual(await err.mapOrElse(() => 0, async i => i + 1).ok(), Option.Some(0));
}

main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### V 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fallback | `function` |
| fn | `function` |

**Returns:** `Promise`<[Ok](../interfaces/_result_.ok.md)<`V`>>

___
<a id="ok"></a>

###  ok

▸ **ok**(): `Promise`<`Option`<`Payload`>>

*Defined in [result.ts:248](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L248)*

Converts from `Result<T>` to `Option<T>`.

Converts into an `Option<T>`, and discarding the error, if any.

```ts
import * as assert from "assert";
import { Result } from "@marionebl/result";

async function main() {
 const ok = Result.Ok(1);
 const err = Result.Err(new Error('Something went wrong.'));

 assert.strictDeepEqual(await ok.ok(), Option.Some(1));
 assert.strictDeepEqual(await err.ok(), Option.None());
}

main().catch((err) => {
  throw err
});
```

**Returns:** `Promise`<`Option`<`Payload`>>

___
<a id="or"></a>

###  or

▸ **or**<`T`,`V`>(b: *`T`*): `Promise`<`this` \| `T`>

*Defined in [result.ts:467](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L467)*

Returns the success if it contains a value, otherwise returns `b`.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  {
    const ok = Result.Ok(2);
    const err = Result.Err(new Error(""));
    const result = await ok.or(err);
    assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
  }

  {
    const err = Result.Err(new Error(""));
    const ok = Result.Ok(2);
    const result = await err.or(ok);
    assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
  }

  {
    const a = Result.Ok(100);
    const b = Result.Ok(2);
    const result = await a.or(b);
    assert.deepStrictEqual(await result.sync(), await a.sync());
  }

  {
    const a = Result.Err(new Error(""));
    const b = Result.Err(new Error(""));
    const result = await a.or(b);
    assert.deepStrictEqual(await result.sync(), await Option.Err(new Error("")).sync());
  }
}

 main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### T :  [Result]()<`V`>
#### V 
**Parameters:**

| Name | Type |
| ------ | ------ |
| b | `T` |

**Returns:** `Promise`<`this` \| `T`>

___
<a id="orelse"></a>

###  orElse

▸ **orElse**<`T`,`V`>(fn: *`function`*): `Promise`<`this` \| `T`>

*Defined in [result.ts:517](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L517)*

Calls `fn` if the result is `Err`, otherwise returns the `Ok` value.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  {
    const ok = Result.Ok(2);
    const err = Result.Err(new Error(""));
    const result = await ok.orElse(async () => err);
    assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
  }

  {
    const err = Result.Err(new Error(""));
    const ok = Result.Ok(2);
    const result = await err.orElse(async () => ok);
    assert.deepStrictEqual(await result.sync(), await Result.Ok(2).sync());
  }

  {
    const a = Result.Ok(100);
    const b = Result.Ok(2);
    const result = await a.orElse(async () => b);
    assert.deepStrictEqual(await result.sync(), await a.sync());
  }

  {
    const a = Result.Err(new Error(""));
    const b = Result.Err(new Error(""));
    const result = await a.orElse(async () => b);
    assert.deepStrictEqual(await result.sync(), await Option.Err(new Error("")).sync());
  }
}

 main().catch((err) => {
  throw err
});
```

**Type parameters:**

#### T :  [Result]()<`V`>
#### V 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** `Promise`<`this` \| `T`>

___
<a id="sync"></a>

###  sync

▸ **sync**(): `Promise`<[Result]()<`Payload`>>

*Defined in [result.ts:74](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L74)*

**Returns:** `Promise`<[Result]()<`Payload`>>

___
<a id="transpose"></a>

###  transpose

▸ **transpose**(): `Promise`<`Option`<[Result]()<`Payload`>>>

*Defined in [result.ts:717](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L717)*

**Returns:** `Promise`<`Option`<[Result]()<`Payload`>>>

___
<a id="unwrap"></a>

###  unwrap

▸ **unwrap**(): `Promise`<`Payload`>

*Defined in [result.ts:602](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L602)*

Unwraps a result, yielding the content of an `Ok`.

*__throws__*: Throws if the value is an `Err`, with a panic message provided by the `Err` value.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.strictEqual(await some.unwrap(), 1);

  const none = Result.Err(new Error("..."));
  assert.rejects(async () => await none.unwrap(), new Error("..."));
}

main().catch(err => {
  throw err;
});
```

**Returns:** `Promise`<`Payload`>

___
<a id="unwraperr"></a>

###  unwrapErr

▸ **unwrapErr**(): `Promise`<`Error`>

*Defined in [result.ts:668](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L668)*

Unwraps a result, yielding the content of an `Err`.

*__throws__*: Throws if the value is an `Ok`, with a panic message including the content of the `Ok`.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.rejects(async () => await some.unwrapErr(), new Error("1"))

  const none = Result.Err(new Error("..."));
  assert.strictEqual(await none.unwrapErr(), new Error("..."));
}

main().catch(err => {
  throw err;
});
```

**Returns:** `Promise`<`Error`>

___
<a id="unwrapor"></a>

###  unwrapOr

▸ **unwrapOr**<`T`>(fallback: *`T`*): `Promise`<`Payload` \| `T`>

*Defined in [result.ts:545](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L545)*

Unwraps a result, yielding the content of an `Ok`. Else, it returns `b`.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.strictEqual(await some.unwrapOr(2), 1);

  const none = Result.Err(new Error(""));
  assert.strictEqual(await none.unwrapOr(2), 2);
}

main().catch(err => {
  throw err;
});
```

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fallback | `T` |

**Returns:** `Promise`<`Payload` \| `T`>

___
<a id="unwraporelse"></a>

###  unwrapOrElse

▸ **unwrapOrElse**<`T`>(fn: *`function`*): `Promise`<`Payload` \| `T`>

*Defined in [result.ts:573](https://github.com/marionebl/result/blob/23005dc/src/result.ts#L573)*

Unwraps a result, yielding the content of an `Ok`. If the value is an `Err` then it calls `fn` with its value.

```ts
import * as assert from 'assert';
import { Result } from '@marionebl/result';

async function main() {
  const some = Result.Ok(1);
  assert.strictEqual(await some.unwrapOrElse(async () => 2), 1);

  const none = Result.Err(new Error("..."));
  assert.strictEqual(await none.unwrapOrElse(async (err) => err.message.length), 3);
}

main().catch(err => {
  throw err;
});
```

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| fn | `function` |

**Returns:** `Promise`<`Payload` \| `T`>


## License

MIT. Copyright 2019 - present Mario Nebl

[ci-badge]: https://img.shields.io/circleci/project/github/marionebl/result/master.svg?style=flat-square
[ci-url]: https://circleci.com/gh/marionebl/result

[npm-badge]: https://img.shields.io/npm/v/@marionebl/result.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@marionebl/result