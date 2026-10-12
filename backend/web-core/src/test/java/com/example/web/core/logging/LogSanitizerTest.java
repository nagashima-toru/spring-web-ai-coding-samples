package com.example.web.core.logging;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class LogSanitizerTest {

    @Test
    void 制御文字を含む_アンダースコアに置き換える() {
        assertThat(LogSanitizer.sanitize("a\nb\rc\td")).isEqualTo("a_b_c_d");
    }

    @Test
    void 制御文字を含まない_そのまま返す() {
        assertThat(LogSanitizer.sanitize("admin-01")).isEqualTo("admin-01");
    }

    @Test
    void null_文字列nullを返す() {
        assertThat(LogSanitizer.sanitize(null)).isEqualTo("null");
    }
}
