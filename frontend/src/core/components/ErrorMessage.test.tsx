import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('inline variant (default)', () => {
    it('should render error message', () => {
      render(<ErrorMessage message="Test error" />);
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ErrorMessage message="Test error" className="custom-class" />);
      const element = screen.getByTestId('error-message');
      expect(element).toHaveClass('custom-class');
    });

    it('should render AlertCircle icon', () => {
      const { container } = render(<ErrorMessage message="Test error" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('card variant', () => {
    it('should render as card with border', () => {
      render(<ErrorMessage message="Test error" variant="card" />);
      const element = screen.getByTestId('error-message');
      expect(element).toHaveClass('rounded-lg');
      expect(element).toHaveClass('border');
    });

    it('should render "Error" heading in card variant', () => {
      render(<ErrorMessage message="Test error" variant="card" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render with custom className in card variant', () => {
      render(<ErrorMessage message="Test error" variant="card" className="custom-class" />);
      const element = screen.getByTestId('error-message');
      expect(element).toHaveClass('custom-class');
    });
  });

  describe('edge cases', () => {
    it('should render empty string message', () => {
      render(<ErrorMessage message="" />);
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('should render long error message', () => {
      const longMessage = 'This is a very long error message '.repeat(10);
      render(<ErrorMessage message={longMessage} />);
      // Use partial match for long messages
      expect(screen.getByText(/This is a very long error message/)).toBeInTheDocument();
    });

    it('should render error message with special characters', () => {
      const specialMessage = '<script>alert("XSS")</script>';
      render(<ErrorMessage message={specialMessage} />);
      // React automatically escapes HTML, so it should be rendered as text
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should render error message with line breaks', () => {
      const multilineMessage = 'Error line 1\nError line 2';
      render(<ErrorMessage message={multilineMessage} />);
      // Use regex to match text with line breaks (normalized)
      expect(screen.getByText(/Error line 1.*Error line 2/s)).toBeInTheDocument();
    });

    it('should render error message with Unicode characters', () => {
      const unicodeMessage = 'エラーが発生しました 🚨';
      render(<ErrorMessage message={unicodeMessage} />);
      expect(screen.getByText(unicodeMessage)).toBeInTheDocument();
    });
  });
});
