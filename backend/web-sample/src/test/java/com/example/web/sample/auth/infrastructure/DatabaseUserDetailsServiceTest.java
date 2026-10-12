package com.example.web.sample.auth.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.web.sample.auth.domain.Role;
import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class DatabaseUserDetailsServiceTest {

    private final UserRepository repository = mock(UserRepository.class);
    private final DatabaseUserDetailsService service = new DatabaseUserDetailsService(repository);

    @Test
    void 存在する利用者_ハッシュとロールと有効状態を詰める() {
        when(repository.findByUsername("viewer"))
                .thenReturn(Optional.of(new User(2L, "viewer", "hash", Role.VIEWER, false)));

        UserDetails details = service.loadUserByUsername("viewer");

        assertThat(details.getPassword()).isEqualTo("hash");
        assertThat(details.getAuthorities()).extracting(GrantedAuthority::getAuthority).containsExactly("ROLE_VIEWER");
        assertThat(details.isEnabled()).isFalse();
    }

    @Test
    void 存在しない利用者_UsernameNotFoundException() {
        when(repository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("ghost")).isInstanceOf(UsernameNotFoundException.class);
    }
}
