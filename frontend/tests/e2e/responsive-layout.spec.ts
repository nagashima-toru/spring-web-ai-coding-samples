import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers';

// iPhone 相当の幅で、ページ全体に横スクロールが出ないことを確認する（#10 の再発防止）
test.use({ viewport: { width: 390, height: 844 } });

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('モバイル幅のレイアウト', () => {
  test('admin でログインした一覧画面に横スクロールが出ない（日本語・英語）', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('create-message-button')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeInViewport({ ratio: 1 });
    await expectNoHorizontalOverflow(page);

    const switcher = page.getByTestId('language-switcher');
    await switcher.click();
    await expect(switcher).toHaveText('🌐 English');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeInViewport({ ratio: 1 });
    await expectNoHorizontalOverflow(page);
  });
});
