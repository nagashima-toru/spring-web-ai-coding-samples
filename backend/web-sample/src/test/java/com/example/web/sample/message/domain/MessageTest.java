package com.example.web.sample.message.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.web.core.exception.InvalidInputException;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class MessageTest {

    private static final OffsetDateTime T1 = OffsetDateTime.parse("2026-01-01T09:00:00+09:00");
    private static final OffsetDateTime T2 = OffsetDateTime.parse("2026-01-02T09:00:00+09:00");

    @Test
    void create_IDは未採番で作成日時と更新日時は同じ() {
        Message message = Message.create("code", "content", T1);

        assertThat(message).isEqualTo(new Message(null, "code", "content", T1, T1));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = " ")
    void create_コードが空_InvalidInputException(String code) {
        assertThatThrownBy(() -> Message.create(code, "content", T1)).isInstanceOf(InvalidInputException.class)
                .hasMessageContaining("コード");
    }

    @Test
    void create_コードが最大長_作成できる() {
        assertThat(Message.create("a".repeat(Message.MAX_CODE_LENGTH), "content", T1).code()).hasSize(50);
    }

    @Test
    void create_コードが最大長超過_InvalidInputException() {
        assertThatThrownBy(() -> Message.create("a".repeat(Message.MAX_CODE_LENGTH + 1), "content", T1))
                .isInstanceOf(InvalidInputException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = " ")
    void create_本文が空_InvalidInputException(String content) {
        assertThatThrownBy(() -> Message.create("code", content, T1)).isInstanceOf(InvalidInputException.class)
                .hasMessageContaining("本文");
    }

    @Test
    void create_本文が最大長超過_InvalidInputException() {
        assertThatThrownBy(() -> Message.create("code", "a".repeat(Message.MAX_CONTENT_LENGTH + 1), T1))
                .isInstanceOf(InvalidInputException.class);
    }

    @Test
    void update_作成日時は保ち更新日時だけ変わる() {
        Message updated = new Message(1L, "old", "old", T1, T1).update("new", "new content", T2);

        assertThat(updated).isEqualTo(new Message(1L, "new", "new content", T1, T2));
    }

    @Test
    void update_不変条件違反_InvalidInputException() {
        Message message = new Message(1L, "old", "old", T1, T1);

        assertThatThrownBy(() -> message.update("", "content", T2)).isInstanceOf(InvalidInputException.class);
    }

    @Test
    void withId_IDだけを付与する() {
        assertThat(Message.create("code", "content", T1).withId(5L).id()).isEqualTo(5L);
    }

    @Test
    void isCodeChangedTo_同じコードならfalse異なればtrue() {
        Message message = new Message(1L, "code", "content", T1, T1);

        assertThat(message.isCodeChangedTo("code")).isFalse();
        assertThat(message.isCodeChangedTo("other")).isTrue();
    }
}
