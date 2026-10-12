'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'id' | 'code' | 'content';
export type SortDirection = 'asc' | 'desc';

interface MessageTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function MessageTableHeader({ sortField, sortDirection, onSort }: MessageTableHeaderProps) {
  const t = useTranslations('messages.table');
  const getSortIcon = useCallback(
    (field: SortField) => {
      if (sortField !== field) {
        return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
      }
      return sortDirection === 'asc' ? (
        <ArrowUp className="h-4 w-4 ml-1 inline" />
      ) : (
        <ArrowDown className="h-4 w-4 ml-1 inline" />
      );
    },
    [sortField, sortDirection]
  );

  const getSortLabel = useCallback(
    (field: SortField, translatedName: string) => {
      if (sortField !== field) {
        return t('sortBy', { field: translatedName });
      }
      return sortDirection === 'asc'
        ? t('sortByAsc', { field: translatedName })
        : t('sortByDesc', { field: translatedName });
    },
    [sortField, sortDirection, t]
  );

  return (
    <TableHeader data-testid="message-table-header">
      <TableRow>
        <TableHead className="w-[100px]">
          <button
            onClick={() => onSort('id')}
            className="flex items-center hover:text-foreground"
            aria-label={getSortLabel('id', t('id'))}
            aria-pressed={sortField === 'id'}
          >
            {t('id')}
            {getSortIcon('id')}
          </button>
        </TableHead>
        <TableHead className="w-[200px]">
          <button
            onClick={() => onSort('code')}
            className="flex items-center hover:text-foreground"
            aria-label={getSortLabel('code', t('code'))}
            aria-pressed={sortField === 'code'}
          >
            {t('code')}
            {getSortIcon('code')}
          </button>
        </TableHead>
        <TableHead>
          <button
            onClick={() => onSort('content')}
            className="flex items-center hover:text-foreground"
            aria-label={getSortLabel('content', t('content'))}
            aria-pressed={sortField === 'content'}
          >
            {t('content')}
            {getSortIcon('content')}
          </button>
        </TableHead>
        <TableHead className="w-[150px] text-right">{t('actions')}</TableHead>
      </TableRow>
    </TableHeader>
  );
}
