'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { useGetAllMessages } from '@/core/api/generated/message/message';
import { MessageResponse } from '@/core/api/generated/models';
import { Loading } from '@/core/components/Loading';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import { Table, TableBody } from '@/core/components/ui/table';
import { SearchBar } from './SearchBar';
import { Pagination } from '@/core/components/Pagination';
import { MessageTableHeader, SortField, SortDirection } from './MessageTableHeader';
import { MessageTableRow, MessageCard } from './MessageTableRow';
import { useDebounce } from '@/core/hooks/useDebounce';
import { usePermission } from '@/core/auth/usePermission';

interface MessageTableProps {
  onEdit?: (message: MessageResponse) => void;
  onDelete?: (message: MessageResponse) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * MessageTable component displays a list of messages with search, sort, and pagination features.
 * Includes responsive design with table view for desktop and card view for mobile.
 *
 * @param onEdit - Callback function triggered when edit button is clicked
 * @param onDelete - Callback function triggered when delete button is clicked
 */
export function MessageTable({ onEdit, onDelete }: MessageTableProps) {
  const t = useTranslations('messages');
  const { data, isLoading, error } = useGetAllMessages();
  const messages = useMemo(() => data?.content ?? [], [data?.content]);
  const { isReadOnly } = usePermission();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [previousSearch, setPreviousSearch] = useState(debouncedSearch);

  // Reset to page 1 when search query changes
  if (debouncedSearch !== previousSearch) {
    setCurrentPage(1);
    setPreviousSearch(debouncedSearch);
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMessages = useMemo(() => {
    let result = [...messages];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.code?.toLowerCase().includes(query) || msg.content?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let aValue: string | number = a[sortField] ?? '';
      let bValue: string | number = b[sortField] ?? '';

      if (sortField === 'id') {
        aValue = Number(aValue ?? 0);
        bValue = Number(bValue ?? 0);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [messages, debouncedSearch, sortField, sortDirection]);

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedMessages.slice(startIndex, endIndex);
  }, [filteredAndSortedMessages, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedMessages.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
        <Loading size="lg" text={t('loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <ErrorMessage message={t('loadError')} variant="card" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12" role="status">
        <p className="text-muted-foreground text-lg">{t('noMessages')}</p>
        <p className="text-muted-foreground text-sm mt-2">{t('noMessagesHint')}</p>
      </div>
    );
  }

  return (
    <div data-testid="message-table" className="space-y-4">
      {isReadOnly && (
        <div
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
          role="status"
          data-testid="readonly-info-message"
        >
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{t('readOnlyInfo')}</span>
        </div>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('searchPlaceholder')}
        aria-label="Search messages"
      />

      {filteredAndSortedMessages.length === 0 ? (
        <div
          className="text-center py-12 border rounded-lg"
          role="status"
          aria-live="polite"
          data-testid="no-search-results"
        >
          <p className="text-muted-foreground text-lg">{t('noSearchResults')}</p>
          <p className="text-muted-foreground text-sm mt-2">{t('noSearchResultsHint')}</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block" data-testid="message-table-desktop">
              <Table aria-label="Messages table">
                <MessageTableHeader
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableBody>
                  {paginatedMessages.map((message: MessageResponse) => (
                    <MessageTableRow
                      key={message.id}
                      message={message}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div
              className="md:hidden divide-y"
              data-testid="message-table-mobile"
              role="list"
              aria-label="Messages list"
            >
              {paginatedMessages.map((message: MessageResponse) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSortedMessages.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
