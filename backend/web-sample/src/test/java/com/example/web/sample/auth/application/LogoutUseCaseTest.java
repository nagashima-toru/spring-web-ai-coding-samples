package com.example.web.sample.auth.application;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.example.web.core.security.RefreshTokenStore;
import org.junit.jupiter.api.Test;

class LogoutUseCaseTest {

    @Test
    void ログアウト_リフレッシュトークンを破棄する() {
        RefreshTokenStore store = mock(RefreshTokenStore.class);

        new LogoutUseCase(store).execute("refresh");

        verify(store).remove("refresh");
    }
}
