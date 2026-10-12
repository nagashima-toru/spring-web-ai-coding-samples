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
import com.example.web.sample.message.domain.MessageRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class CreateMessageUseCaseTest {

    private static final Instant NOW = Instant.parse("2026-01-01T00:00:00Z");

    private final MessageRepository repository = mock(MessageRepository.class);
    private final CreateMessageUseCase useCase =
            new CreateMessageUseCase(repository, Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void 未使用のコード_現在日時で登録する() {
        when(repository.existsByCode("code")).thenReturn(false);
        when(repository.insert(any())).thenAnswer(invocation -> invocation.<Message>getArgument(0).withId(1L));

        Message created = useCase.execute("code", "content");

        OffsetDateTime now = OffsetDateTime.ofInstant(NOW, ZoneOffset.UTC);
        assertThat(created).isEqualTo(new Message(1L, "code", "content", now, now));
    }

    @Test
    void 使用済みのコード_DuplicateMessageCodeExceptionで登録しない() {
        when(repository.existsByCode("code")).thenReturn(true);

        assertThatThrownBy(() -> useCase.execute("code", "content"))
                .isInstanceOf(DuplicateMessageCodeException.class);
        verify(repository, never()).insert(any());
    }
}
