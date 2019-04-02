import { Result } from "./result";

describe('.isErr', () => {
    test('returns true for exceptions', async () => {
        const result = Result.from(new Error('Something went wrong'));

        expect(await result.isErr()).toBe(true);
    });

    test('returns true for rejecting promises', async () => {
        const result = Result.from(Promise.resolve().then(() => {
            throw new Error('Something went wrong');
        }));

        expect(await result.isErr()).toBe(true);
    });

    test('returns false for payload', async () => {
        const result = Result.from(undefined);

        expect(await result.isErr()).toBe(false);
    });

    test('returns false for async payload', async () => {
        const result = Result.from(Promise.resolve());

        expect(await result.isErr()).toBe(false);
    });
});

describe('.isOk', () => {
    test('returns false for exceptions', async () => {
        const result = Result.from(new Error('Something went wrong'));
        
        expect(await result.isOk()).toBe(false);
    });

    test('returns true false rejecting promises', async () => {
        const result = Result.from(Promise.resolve().then(() => {
            throw new Error('Something went wrong');
        }));

        expect(await result.isOk()).toBe(false);
    });

    test('returns true for payload', async () => {
        const result = Result.from(undefined);

        expect(await result.isOk()).toBe(true);
    });

    test('returns true for async payload', async () => {
        const result = Result.from(Promise.resolve());

        expect(await result.isOk()).toBe(true);
    });
});