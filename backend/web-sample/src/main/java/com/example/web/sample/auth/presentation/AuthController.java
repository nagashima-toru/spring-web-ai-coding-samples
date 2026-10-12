package com.example.web.sample.auth.presentation;

import com.example.web.sample.auth.application.AuthTokens;
import com.example.web.sample.auth.application.GetCurrentUserUseCase;
import com.example.web.sample.auth.application.LoginUseCase;
import com.example.web.sample.auth.application.LogoutUseCase;
import com.example.web.sample.auth.application.RefreshTokenUseCase;
import com.example.web.sample.auth.domain.User;
import com.example.web.sample.generated.api.AuthApi;
import com.example.web.sample.generated.model.LoginRequest;
import com.example.web.sample.generated.model.LoginResponse;
import com.example.web.sample.generated.model.RefreshRequest;
import com.example.web.sample.generated.model.UserResponse;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;

/** 認証 API（OpenAPI 定義から生成した {@link AuthApi} の実装）。 */
@RestController
public class AuthController implements AuthApi {

    private static final String TOKEN_TYPE = "Bearer";

    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;

    /**
     * Controller を生成する。
     *
     * @param loginUseCase ログイン
     * @param refreshTokenUseCase トークン再発行
     * @param logoutUseCase ログアウト
     * @param getCurrentUserUseCase ログイン中の利用者の取得
     */
    public AuthController(LoginUseCase loginUseCase, RefreshTokenUseCase refreshTokenUseCase,
            LogoutUseCase logoutUseCase, GetCurrentUserUseCase getCurrentUserUseCase) {
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.getCurrentUserUseCase = getCurrentUserUseCase;
    }

    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest loginRequest) {
        return ResponseEntity.ok(toResponse(loginUseCase.execute(loginRequest.getUsername(),
                loginRequest.getPassword())));
    }

    @Override
    public ResponseEntity<LoginResponse> refreshToken(RefreshRequest refreshRequest) {
        return ResponseEntity.ok(toResponse(refreshTokenUseCase.execute(refreshRequest.getRefreshToken())));
    }

    @Override
    public ResponseEntity<Void> logout(RefreshRequest refreshRequest) {
        logoutUseCase.execute(refreshRequest.getRefreshToken());
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<UserResponse> getCurrentUser() {
        String username = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getName)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("認証情報がありません"));
        User user = getCurrentUserUseCase.execute(username);
        return ResponseEntity.ok(new UserResponse(user.username(), UserResponse.RoleEnum.valueOf(user.role().name())));
    }

    private static LoginResponse toResponse(AuthTokens tokens) {
        return new LoginResponse(tokens.accessToken(), tokens.refreshToken(), TOKEN_TYPE,
                Math.toIntExact(tokens.expiresIn().toSeconds()));
    }
}
