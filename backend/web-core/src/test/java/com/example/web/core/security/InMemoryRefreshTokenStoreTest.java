package com.example.web.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class InMemoryRefreshTokenStoreTest {

    private final InMemoryRefreshTokenStore store = new InMemoryRefreshTokenStore();

    @Test
    void 保管したトークン_主体を返す() {
        store.save("token", "admin");

        assertThat(store.findSubject("token")).contains("admin");
    }

    @Test
    void 保管していないトークン_空を返す() {
        assertThat(store.findSubject("unknown")).isEmpty();
    }

    @Test
    void 破棄したトークン_空を返す() {
        store.save("token", "admin");
        store.remove("token");

        assertThat(store.findSubject("token")).isEmpty();
    }
}
