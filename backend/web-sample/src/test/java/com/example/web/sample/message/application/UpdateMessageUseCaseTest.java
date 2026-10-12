package com.example.web.sample.message.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.web.sample.message.domain.DuplicateMessageCodeException;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class UpdateMessageUseCaseTest {

    private static final Instant NOW = Instant.parse("2026-01-02T00:00:00Z");
    private static final OffsetDateTime CREATED = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final Message CURRENT = new Message(1L, "code", "content", CREATED, CREATED);

    private final MessageRepository repository = mock(MessageRepository.class);
    private final UpdateMessageUseCase useCase =
            new UpdateMessageUseCase(repository, Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void コードを変えずに本文を更新_重複チェックせず更新する() {
        when(repository.findById(1L)).thenReturn(Optional.of(CURRENT));

        Message updated = useCase.execute(1L, "code", "new content");

        assertThat(updated).isEqualTo(new Message(1L, "code", "new content", CREATED,
                OffsetDateTime.ofInstant(NOW, ZoneOffset.UTC)));
        verify(repository, never()).existsByCode(any());
        verify(repository).update(updated);
    }

    @Test
    void 未使用のコードに変更_更新する() {
        when(repository.findById(1L)).thenReturn(Optional.of(CURRENT));
        when(repository.existsByCode("new")).thenReturn(false);

        assertThat(useCase.execute(1L, "new", "content").code()).isEqualTo("new");
    }

    @Test
    void 使用済みのコードに変更_DuplicateMessageCodeExceptionで更新しない() {
        when(repository.findById(1L)).thenReturn(Optional.of(CURRENT));
        when(repository.existsByCode("used")).thenReturn(true);

        assertThatThrownBy(() -> useCase.execute(1L, "used", "content"))
                .isInstanceOf(DuplicateMessageCodeException.class);
        verify(repository, never()).update(any());
    }

    @Test
    void 存在しないID_MessageNotFoundException() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(9L, "code", "content"))
                .isInstanceOf(MessageNotFoundException.class);
    }
}
