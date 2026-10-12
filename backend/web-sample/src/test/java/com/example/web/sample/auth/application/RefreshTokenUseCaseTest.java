package com.example.web.sample.auth.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.web.core.security.RefreshTokenStore;
import com.example.web.core.security.TokenClaims;
import com.example.web.core.security.TokenProvider;
import com.example.web.core.security.TokenType;
import com.example.web.sample.auth.domain.Role;
import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

class RefreshTokenUseCaseTest {

    private static final User ADMIN = new User(1L, "admin", "hash", Role.ADMIN, true);

    private final TokenProvider tokenProvider = mock(TokenProvider.class);
    private final RefreshTokenStore store = mock(RefreshTokenStore.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final TokenIssuer tokenIssuer = mock(TokenIssuer.class);
    private final RefreshTokenUseCase useCase =
            new RefreshTokenUseCase(tokenProvider, store, userRepository, tokenIssuer);

    @BeforeEach
    void setUp() {
        when(tokenProvider.parse("refresh"))
                .thenReturn(Optional.of(new TokenClaims("admin", TokenType.REFRESH, Set.of())));
        when(store.findSubject("refresh")).thenReturn(Optional.of("admin"));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(ADMIN));
    }

    @Test
    void 有効なリフレッシュトークン_旧トークンを破棄して新しい組を発行する() {
        AuthTokens tokens = new AuthTokens("access2", "refresh2", Duration.ofHours(1));
        when(tokenIssuer.issue("admin", List.of("ADMIN"))).thenReturn(tokens);

        assertThat(useCase.execute("refresh")).isEqualTo(tokens);
        verify(store).remove("refresh");
    }

    @Test
    void 検証できないトークン_BadCredentialsException() {
        when(tokenProvider.parse("bad")).thenReturn(Optional.empty());

        assertRejected("bad");
    }

    @Test
    void アクセストークン_BadCredentialsException() {
        when(tokenProvider.parse("access"))
                .thenReturn(Optional.of(new TokenClaims("admin", TokenType.ACCESS, Set.of("ADMIN"))));

        assertRejected("access");
    }

    @Test
    void 保管されていないトークン_BadCredentialsException() {
        when(store.findSubject("refresh")).thenReturn(Optional.empty());

        assertRejected("refresh");
    }

    @Test
    void 保管時と主体が異なる_BadCredentialsException() {
        when(store.findSubject("refresh")).thenReturn(Optional.of("other"));

        assertRejected("refresh");
    }

    @Test
    void 無効化された利用者_BadCredentialsException() {
        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.of(new User(1L, "admin", "hash", Role.ADMIN, false)));

        assertRejected("refresh");
    }

    private void assertRejected(String token) {
        assertThatThrownBy(() -> useCase.execute(token)).isInstanceOf(BadCredentialsException.class);
        verify(tokenIssuer, never()).issue(any(), any());
    }
}
