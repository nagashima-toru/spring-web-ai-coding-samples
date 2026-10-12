package com.example.web.sample.message.infrastructure;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.web.sample.message.domain.DuplicateMessageCodeException;
import com.example.web.sample.message.domain.Message;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;

/** 一意制約違反の変換を確かめる（SQL そのものは結合テストで確かめる）。 */
class MessageRepositoryImplTest {

    private static final OffsetDateTime T = OffsetDateTime.parse("2026-01-01T00:00:00Z");

    private final MessageMapper mapper = mock(MessageMapper.class);
    private final MessageRepositoryImpl repository = new MessageRepositoryImpl(mapper);

    @Test
    void 登録で一意制約違反_DuplicateMessageCodeExceptionに変換する() {
        when(mapper.insert(any())).thenThrow(new DuplicateKeyException("duplicate"));

        assertThatThrownBy(() -> repository.insert(Message.create("code", "content", T)))
                .isInstanceOf(DuplicateMessageCodeException.class)
                .hasCauseInstanceOf(DuplicateKeyException.class);
    }

    @Test
    void 更新で一意制約違反_DuplicateMessageCodeExceptionに変換する() {
        when(mapper.update(any())).thenThrow(new DuplicateKeyException("duplicate"));

        assertThatThrownBy(() -> repository.update(new Message(1L, "code", "content", T, T)))
                .isInstanceOf(DuplicateMessageCodeException.class);
    }
}
