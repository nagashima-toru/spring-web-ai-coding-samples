package com.example.web.sample.auth.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;

class LoginUseCaseTest {

    private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
    private final TokenIssuer tokenIssuer = mock(TokenIssuer.class);
    private final LoginUseCase useCase = new LoginUseCase(authenticationManager, tokenIssuer);

    @Test
    void 認証成功_ROLE接頭辞を除いたロールでトークンを発行する() {
        var authenticated = UsernamePasswordAuthenticationToken.authenticated("admin", null,
                AuthorityUtils.createAuthorityList("ROLE_ADMIN", "OTHER_AUTHORITY"));
        when(authenticationManager.authenticate(any())).thenReturn(authenticated);
        AuthTokens tokens = new AuthTokens("access", "refresh", Duration.ofHours(1));
        when(tokenIssuer.issue("admin", List.of("ADMIN"))).thenReturn(tokens);

        assertThat(useCase.execute("admin", "password")).isEqualTo(tokens);
    }

    @Test
    void 認証失敗_例外をそのまま送出しトークンを発行しない() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> useCase.execute("admin", "wrong")).isInstanceOf(BadCredentialsException.class);
        verifyNoInteractions(tokenIssuer);
    }
}
