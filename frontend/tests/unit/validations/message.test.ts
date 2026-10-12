import { describe, it, expect } from 'vitest';
import { messageSchema } from '@/features/messages/validations';

describe('messageSchema', () => {
  describe('正常系', () => {
    it('有効なデータをバリデーションできる', () => {
      const validData = {
        code: 'TEST001',
        content: 'This is a test message',
      };

      const result = messageSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('codeが最大長(50文字)でバリデーションできる', () => {
      const validData = {
        code: 'A'.repeat(50),
        content: 'Test content',
      };

      const result = messageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('contentが最大長(500文字)でバリデーションできる', () => {
      const validData = {
        code: 'TEST001',
        content: 'A'.repeat(500),
      };

      const result = messageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('最小限の有効なデータをバリデーションできる', () => {
      const validData = {
        code: 'A',
        content: 'B',
      };

      const result = messageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('異常系', () => {
    describe('code フィールド', () => {
      it('codeが空文字列の場合、エラーを返す', () => {
        const invalidData = {
          code: '',
          content: 'Test content',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Code is required');
        }
      });

      it('codeが51文字以上の場合、エラーを返す', () => {
        const invalidData = {
          code: 'A'.repeat(51),
          content: 'Test content',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Code must be 50 characters or less');
        }
      });

      it('codeが欠落している場合、エラーを返す', () => {
        const invalidData = {
          content: 'Test content',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('code');
        }
      });

      it('codeがnullの場合、エラーを返す', () => {
        const invalidData = {
          code: null,
          content: 'Test content',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('content フィールド', () => {
      it('contentが空文字列の場合、エラーを返す', () => {
        const invalidData = {
          code: 'TEST001',
          content: '',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Content is required');
        }
      });

      it('contentが501文字以上の場合、エラーを返す', () => {
        const invalidData = {
          code: 'TEST001',
          content: 'A'.repeat(501),
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Content must be 500 characters or less');
        }
      });

      it('contentが欠落している場合、エラーを返す', () => {
        const invalidData = {
          code: 'TEST001',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('content');
        }
      });

      it('contentがnullの場合、エラーを返す', () => {
        const invalidData = {
          code: 'TEST001',
          content: null,
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('複数エラー', () => {
      it('codeとcontentが両方とも無効な場合、複数のエラーを返す', () => {
        const invalidData = {
          code: '',
          content: '',
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBe(2);
          expect(result.error.issues.some((issue) => issue.path.includes('code'))).toBe(true);
          expect(result.error.issues.some((issue) => issue.path.includes('content'))).toBe(true);
        }
      });

      it('codeとcontentが両方とも長すぎる場合、複数のエラーを返す', () => {
        const invalidData = {
          code: 'A'.repeat(51),
          content: 'B'.repeat(501),
        };

        const result = messageSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBe(2);
        }
      });
    });
  });
});
