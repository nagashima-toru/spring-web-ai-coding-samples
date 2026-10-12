package com.example.web.sample.message.application;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import org.junit.jupiter.api.Test;

class DeleteMessageUseCaseTest {

    private final MessageRepository repository = mock(MessageRepository.class);
    private final DeleteMessageUseCase useCase = new DeleteMessageUseCase(repository);

    @Test
    void 存在するID_削除する() {
        when(repository.deleteById(1L)).thenReturn(true);

        assertThatCode(() -> useCase.execute(1L)).doesNotThrowAnyException();
    }

    @Test
    void 存在しないID_MessageNotFoundException() {
        when(repository.deleteById(9L)).thenReturn(false);

        assertThatThrownBy(() -> useCase.execute(9L)).isInstanceOf(MessageNotFoundException.class);
    }
}
