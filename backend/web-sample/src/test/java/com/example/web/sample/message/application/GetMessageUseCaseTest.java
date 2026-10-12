package com.example.web.sample.message.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.web.core.paging.PageQuery;
import com.example.web.core.paging.PageResult;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/** 参照系ユースケース（1件取得・一覧取得）のテスト。 */
class GetMessageUseCaseTest {

    private static final OffsetDateTime T = OffsetDateTime.parse("2026-01-01T00:00:00Z");
    private static final Message MESSAGE = new Message(1L, "code", "content", T, T);

    private final MessageRepository repository = mock(MessageRepository.class);

    @Test
    void 存在するID_メッセージを返す() {
        when(repository.findById(1L)).thenReturn(Optional.of(MESSAGE));

        assertThat(new GetMessageUseCase(repository).execute(1L)).isEqualTo(MESSAGE);
    }

    @Test
    void 存在しないID_MessageNotFoundException() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new GetMessageUseCase(repository).execute(9L))
                .isInstanceOf(MessageNotFoundException.class);
    }

    @Test
    void 一覧_リポジトリのページング結果を返す() {
        PageQuery query = new PageQuery(0, 20);
        PageResult<Message> page = PageResult.of(query, List.of(MESSAGE), 1);
        when(repository.findPage(query)).thenReturn(page);

        assertThat(new GetMessagesUseCase(repository).execute(query)).isEqualTo(page);
    }
}
