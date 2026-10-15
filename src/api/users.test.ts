import { describe, expect, it, vi } from 'vitest';
import { getUsers, isUser, parseUsers } from './users';
import { ApiError, fetchJson } from './http';
import { jsonResponse, makeUser, makeUsers } from '@/test/fixtures';

describe('isUser', () => {
  it('accepts a well-formed record', () => {
    expect(isUser(makeUser())).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'user'],
    ['missing email', { ...makeUser(), email: undefined }],
    ['unknown status', { ...makeUser(), status: 'Deleted' }],
    ['invalid date', { ...makeUser(), dateJoined: 'not-a-date' }],
    ['numeric id', { ...makeUser(), id: 42 }],
    ['guarantors not an array', { ...makeUser(), guarantors: {} }],
  ])('rejects %s', (_, value) => {
    expect(isUser(value)).toBe(false);
  });
});

describe('parseUsers', () => {
  it('accepts a bare array', () => {
    expect(parseUsers(makeUsers(3)).users).toHaveLength(3);
  });

  it('accepts a { data } envelope', () => {
    expect(parseUsers({ data: makeUsers(2) }).users).toHaveLength(2);
  });

  it('drops malformed records and reports how many', () => {
    const result = parseUsers([makeUser(), { id: 'broken' }, makeUser()]);
    expect(result.users).toHaveLength(2);
    expect(result.dropped).toBe(1);
  });

  it('throws a parse ApiError for an unexpected shape', () => {
    expect(() => parseUsers({ users: 'nope' })).toThrow(ApiError);
    expect(() => parseUsers('<html>')).toThrow(/unexpected format/);
  });
});

describe('getUsers / fetchJson', () => {
  it('returns parsed users on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(makeUsers(5))));
    await expect(getUsers()).resolves.toHaveLength(5);
  });

  it('raises an http error with the status code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 503 })));
    await expect(getUsers()).rejects.toMatchObject({ kind: 'http', status: 503 });
  });

  it('raises a network error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(getUsers()).rejects.toMatchObject({ kind: 'network' });
  });

  it('raises a parse error for invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 200 })));
    await expect(getUsers()).rejects.toMatchObject({ kind: 'parse' });
  });

  it('times out slow requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          }),
      ),
    );
    await expect(fetchJson('/slow', { timeoutMs: 10 })).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('reports a cancelled request as aborted', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          }),
      ),
    );
    const promise = fetchJson('/x', { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ kind: 'aborted' });
  });
});
