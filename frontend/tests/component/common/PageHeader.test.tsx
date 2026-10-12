import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from '@/core/components/PageHeader';

describe('PageHeader', () => {
  it('タイトルが表示される', () => {
    render(<PageHeader title="Test Title" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test Title');
  });

  it('説明文が表示される', () => {
    render(<PageHeader title="Test Title" description="Test description text" />);

    expect(screen.getByText('Test description text')).toBeInTheDocument();
  });

  it('説明文が未指定の場合は表示されない', () => {
    render(<PageHeader title="Test Title" />);

    const description = screen.queryByText(/description/i);
    expect(description).not.toBeInTheDocument();
  });

  it('アクション要素が表示される', () => {
    const action = <button>Test Action</button>;

    render(<PageHeader title="Test Title" action={action} />);

    expect(screen.getByRole('button', { name: 'Test Action' })).toBeInTheDocument();
  });

  it('アクション要素が未指定の場合は表示されない', () => {
    render(<PageHeader title="Test Title" />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<PageHeader title="Test Title" className="custom-class" />);

    const pageHeader = container.firstChild;
    expect(pageHeader).toHaveClass('custom-class');
  });

  it('タイトル、説明、アクションがすべて表示される', () => {
    const action = (
      <button type="button" data-testid="action-button">
        Action
      </button>
    );

    render(
      <PageHeader
        title="Complete Page Header"
        description="This is a complete example"
        action={action}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Complete Page Header');
    expect(screen.getByText('This is a complete example')).toBeInTheDocument();
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
  });

  it('複数のアクション要素が表示される', () => {
    const actions = (
      <>
        <button type="button">Action 1</button>
        <button type="button">Action 2</button>
      </>
    );

    render(<PageHeader title="Test Title" action={actions} />);

    expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
  });
});
