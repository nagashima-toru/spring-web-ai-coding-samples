package com.example.web.sample.auth.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.web.core.security.RefreshTokenStore;
import com.example.web.core.security.TokenProvider;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;

class TokenIssuerTest {

    private final TokenProvider tokenProvider = mock(TokenProvider.class);
    private final RefreshTokenStore store = mock(RefreshTokenStore.class);

    @Test
    void 発行_トークンの組を返しリフレッシュトークンを保管する() {
        when(tokenProvider.createAccessToken("admin", List.of("ADMIN"))).thenReturn("access");
        when(tokenProvider.createRefreshToken("admin")).thenReturn("refresh");
        when(tokenProvider.accessTokenTtl()).thenReturn(Duration.ofHours(1));

        AuthTokens tokens = new TokenIssuer(tokenProvider, store).issue("admin", List.of("ADMIN"));

        assertThat(tokens).isEqualTo(new AuthTokens("access", "refresh", Duration.ofHours(1)));
        verify(store).save("refresh", "admin");
    }
}
