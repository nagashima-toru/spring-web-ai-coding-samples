import { describe, it, expect, vi } from 'vitest';
import { getApiErrorMessage } from '@/core/lib/errorHandling';

// Mock t function that returns the key itself for predictable assertions
const mockT = vi.fn((key: string) => key);

describe('getApiErrorMessage', () => {
  it('null または undefined を返す（error が null の場合）', () => {
    expect(getApiErrorMessage(null, mockT)).toBeNull();
  });

  it('409 Conflict エラーメッセージを返す', () => {
    const error = {
      response: {
        status: 409,
        data: {},
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.conflict');
  });

  it('404 Not Found エラーメッセージを返す', () => {
    const error = {
      response: {
        status: 404,
        data: {},
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.notFound');
  });

  it('400 Bad Request エラーメッセージを返す（カスタムメッセージあり）', () => {
    const error = {
      response: {
        status: 400,
        data: {
          message: 'Invalid code format',
        },
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('Invalid code format');
  });

  it('400 Bad Request エラーメッセージを返す（カスタムメッセージなし）', () => {
    const error = {
      response: {
        status: 400,
        data: {},
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.badRequest');
  });

  it('500 Server Error エラーメッセージを返す', () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.serverError');
  });

  it('ECONNABORTED エラーメッセージを返す', () => {
    const error = {
      code: 'ECONNABORTED',
      message: 'timeout of 1000ms exceeded',
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.networkError');
  });

  it('ERR_NETWORK エラーメッセージを返す', () => {
    const error = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.networkError');
  });

  it('カスタムメッセージを持つエラーオブジェクトからメッセージを抽出する', () => {
    const error = {
      response: {
        data: {
          message: 'Custom error message',
        },
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('Custom error message');
  });

  it('response.data.message がない場合、error.message を使用する', () => {
    const error = {
      message: 'Something went wrong',
    };

    expect(getApiErrorMessage(error, mockT)).toBe('Something went wrong');
  });

  it('不明なエラーの場合、unexpected キーを返す', () => {
    const error = {
      some: 'unknown error',
    };

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.unexpected');
  });

  it('文字列エラーの場合、unexpected キーを返す', () => {
    const error = 'Some error string';

    expect(getApiErrorMessage(error, mockT)).toBe('messages.errors.unexpected');
  });

  it('その他のステータスコードの場合、カスタムメッセージまたは unexpected キーを返す', () => {
    const error = {
      response: {
        status: 403,
        data: {
          message: 'Forbidden',
        },
      },
    };

    expect(getApiErrorMessage(error, mockT)).toBe('Forbidden');
  });
});
