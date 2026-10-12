import { Search } from 'lucide-react';
import { Input } from '@/core/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search messages...' }: SearchBarProps) {
  return (
    <div data-testid="search-bar" className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        data-testid="search-input"
      />
    </div>
  );
}
