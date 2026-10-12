import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MessageTableHeader } from '@/features/messages/components/MessageTableHeader';
import { createLocaleWrapper } from '../../unit/helpers/localeTestHelper';

describe('MessageTableHeader', () => {
  it('すべてのカラムヘッダーが表示される', () => {
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('コード')).toBeInTheDocument();
    expect(screen.getByText('コンテンツ')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('IDカラムクリックで onSort が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="code" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const idButton = screen.getByRole('button', { name: /IDでソート/ });
    await user.click(idButton);

    expect(onSort).toHaveBeenCalledWith('id');
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('Codeカラムクリックで onSort が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const codeButton = screen.getByRole('button', { name: /コードでソート/ });
    await user.click(codeButton);

    expect(onSort).toHaveBeenCalledWith('code');
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('Contentカラムクリックで onSort が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const contentButton = screen.getByRole('button', { name: /コンテンツでソート/ });
    await user.click(contentButton);

    expect(onSort).toHaveBeenCalledWith('content');
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('選択中のカラムにはaria-pressed=trueが設定される', () => {
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="code" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const idButton = screen.getByRole('button', { name: /IDでソート/ });
    const codeButton = screen.getByRole('button', { name: /コードでソート/ });
    const contentButton = screen.getByRole('button', { name: /コンテンツでソート/ });

    expect(idButton).toHaveAttribute('aria-pressed', 'false');
    expect(codeButton).toHaveAttribute('aria-pressed', 'true');
    expect(contentButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('昇順の場合、適切なaria-labelが設定される', () => {
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const idButton = screen.getByRole('button', {
      name: /IDでソート（昇順）/,
    });
    expect(idButton).toBeInTheDocument();
  });

  it('降順の場合、適切なaria-labelが設定される', () => {
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="code" sortDirection="desc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const codeButton = screen.getByRole('button', {
      name: /コードでソート（降順）/,
    });
    expect(codeButton).toBeInTheDocument();
  });

  it('未選択のカラムには基本的なaria-labelが設定される', () => {
    const onSort = vi.fn();

    render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: createLocaleWrapper() }
    );

    const codeButton = screen.getByRole('button', { name: 'コードでソート' });
    const contentButton = screen.getByRole('button', { name: 'コンテンツでソート' });

    expect(codeButton).toBeInTheDocument();
    expect(contentButton).toBeInTheDocument();
  });

  it('sortFieldとsortDirectionを変更すると表示が更新される', () => {
    const onSort = vi.fn();
    const Wrapper = createLocaleWrapper();
    const { rerender } = render(
      <table>
        <MessageTableHeader sortField="id" sortDirection="asc" onSort={onSort} />
      </table>,
      { wrapper: Wrapper }
    );

    // 初期状態: ID昇順
    expect(screen.getByRole('button', { name: /IDでソート（昇順）/ })).toBeInTheDocument();

    // 再レンダリング: Code降順
    rerender(
      <table>
        <MessageTableHeader sortField="code" sortDirection="desc" onSort={onSort} />
      </table>
    );

    expect(screen.getByRole('button', { name: /コードでソート（降順）/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IDでソート' })).toBeInTheDocument();
  });
});
