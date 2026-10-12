package com.example.web.sample.auth.application;

import com.example.web.core.security.RefreshTokenStore;
import com.example.web.core.security.TokenProvider;
import java.util.List;
import org.springframework.stereotype.Component;

/** アクセストークンとリフレッシュトークンを組で発行し、リフレッシュトークンを保管する。 */
@Component
public class TokenIssuer {

    private final TokenProvider tokenProvider;
    private final RefreshTokenStore refreshTokenStore;

    /**
     * 部品を生成する。
     *
     * @param tokenProvider トークンの発行部品
     * @param refreshTokenStore リフレッシュトークンの保管庫
     */
    public TokenIssuer(TokenProvider tokenProvider, RefreshTokenStore refreshTokenStore) {
        this.tokenProvider = tokenProvider;
        this.refreshTokenStore = refreshTokenStore;
    }

    /**
     * トークンを発行する。
     *
     * @param username ユーザー名
     * @param roles ロール（{@code ROLE_} 接頭辞なし）
     * @return 発行したトークン
     */
    public AuthTokens issue(String username, List<String> roles) {
        String accessToken = tokenProvider.createAccessToken(username, roles);
        String refreshToken = tokenProvider.createRefreshToken(username);
        refreshTokenStore.save(refreshToken, username);
        return new AuthTokens(accessToken, refreshToken, tokenProvider.accessTokenTtl());
    }
}
