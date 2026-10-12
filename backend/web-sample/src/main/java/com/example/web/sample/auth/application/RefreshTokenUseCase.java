package com.example.web.sample.auth.application;

import com.example.web.core.security.RefreshTokenStore;
import com.example.web.core.security.TokenClaims;
import com.example.web.core.security.TokenProvider;
import com.example.web.core.security.TokenType;
import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

/**
 * トークン再発行。有効なリフレッシュトークンと引き換えに、新しいトークンの組を発行する。
 *
 * <p>使ったリフレッシュトークンは破棄する（ローテーション）。漏えいしたトークンの再利用を防ぐため。</p>
 */
@Service
public class RefreshTokenUseCase {

    private static final String INVALID = "リフレッシュトークンが無効です";

    private final TokenProvider tokenProvider;
    private final RefreshTokenStore refreshTokenStore;
    private final UserRepository userRepository;
    private final TokenIssuer tokenIssuer;

    /**
     * ユースケースを生成する。
     *
     * @param tokenProvider トークンの検証部品
     * @param refreshTokenStore リフレッシュトークンの保管庫
     * @param userRepository 利用者のリポジトリ
     * @param tokenIssuer トークンの発行部品
     */
    public RefreshTokenUseCase(TokenProvider tokenProvider, RefreshTokenStore refreshTokenStore,
            UserRepository userRepository, TokenIssuer tokenIssuer) {
        this.tokenProvider = tokenProvider;
        this.refreshTokenStore = refreshTokenStore;
        this.userRepository = userRepository;
        this.tokenIssuer = tokenIssuer;
    }

    /**
     * トークンを再発行する。
     *
     * @param refreshToken リフレッシュトークン
     * @return 新しいトークン
     * @throws BadCredentialsException トークンが無効、保管されていない、または利用者が無効な場合
     */
    public AuthTokens execute(String refreshToken) {
        TokenClaims claims = tokenProvider.parse(refreshToken)
                .filter(c -> c.type() == TokenType.REFRESH)
                .orElseThrow(() -> new BadCredentialsException(INVALID));
        String storedSubject = refreshTokenStore.findSubject(refreshToken)
                .orElseThrow(() -> new BadCredentialsException(INVALID));
        if (!storedSubject.equals(claims.subject())) {
            throw new BadCredentialsException(INVALID);
        }
        User user = userRepository.findByUsername(claims.subject())
                .filter(User::enabled)
                .orElseThrow(() -> new BadCredentialsException(INVALID));
        refreshTokenStore.remove(refreshToken);
        return tokenIssuer.issue(user.username(), List.of(user.role().name()));
    }
}
