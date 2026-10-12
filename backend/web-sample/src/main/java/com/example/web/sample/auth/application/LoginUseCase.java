package com.example.web.sample.auth.application;

import com.example.web.core.logging.LogSanitizer;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

/**
 * ログイン。ユーザー名とパスワードを認証し、トークンを発行する。
 *
 * <p>認証に失敗した場合は Spring Security の {@code AuthenticationException} が送出され、
 * 共通エラー応答（401）になる。ユーザー名の存在有無は応答で区別しない（列挙攻撃の対策）。</p>
 */
@Service
public class LoginUseCase {

    private static final Logger LOG = LoggerFactory.getLogger(LoginUseCase.class);
    private static final String ROLE_PREFIX = "ROLE_";

    private final AuthenticationManager authenticationManager;
    private final TokenIssuer tokenIssuer;

    /**
     * ユースケースを生成する。
     *
     * @param authenticationManager 認証マネージャ
     * @param tokenIssuer トークンの発行部品
     */
    public LoginUseCase(AuthenticationManager authenticationManager, TokenIssuer tokenIssuer) {
        this.authenticationManager = authenticationManager;
        this.tokenIssuer = tokenIssuer;
    }

    /**
     * ログインする。
     *
     * @param username ユーザー名
     * @param password パスワード
     * @return 発行したトークン
     */
    public AuthTokens execute(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(username, password));
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(ROLE_PREFIX))
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .toList();
        LOG.info("ログイン成功: username={}", LogSanitizer.sanitize(authentication.getName()));
        return tokenIssuer.issue(authentication.getName(), roles);
    }
}
