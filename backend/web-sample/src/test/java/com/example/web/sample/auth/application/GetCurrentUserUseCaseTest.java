package com.example.web.sample.auth.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.web.sample.auth.domain.Role;
import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

class GetCurrentUserUseCaseTest {

    private final UserRepository repository = mock(UserRepository.class);
    private final GetCurrentUserUseCase useCase = new GetCurrentUserUseCase(repository);

    @Test
    void 有効な利用者_利用者を返す() {
        User user = new User(1L, "admin", "hash", Role.ADMIN, true);
        when(repository.findByUsername("admin")).thenReturn(Optional.of(user));

        assertThat(useCase.execute("admin")).isEqualTo(user);
    }

    @Test
    void 無効化された利用者_BadCredentialsException() {
        when(repository.findByUsername("admin"))
                .thenReturn(Optional.of(new User(1L, "admin", "hash", Role.ADMIN, false)));

        assertThatThrownBy(() -> useCase.execute("admin")).isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void 存在しない利用者_BadCredentialsException() {
        when(repository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute("ghost")).isInstanceOf(BadCredentialsException.class);
    }
}
