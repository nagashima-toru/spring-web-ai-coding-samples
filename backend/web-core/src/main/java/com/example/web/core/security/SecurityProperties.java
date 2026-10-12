package com.example.web.core.security;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * 認証・認可の設定（接頭辞 {@code app.security}）。
 *
 * @param jwt JWT の設定
 * @param publicPaths 認証なしで呼べるパス（Ant 形式）
 * @param cors CORS の設定
 */
@ConfigurationProperties("app.security")
public record SecurityProperties(Jwt jwt, @DefaultValue List<String> publicPaths, @DefaultValue Cors cors) {

    /** パス一覧を不変コピーとして保持する。 */
    public SecurityProperties {
        publicPaths = List.copyOf(publicPaths);
    }

    /**
     * JWT の設定。
     *
     * @param secret 署名鍵（256 bit 以上。本番は Secrets Manager から環境変数で注入する）
     * @param issuer 発行者
     * @param accessTokenTtl アクセストークンの有効期間
     * @param refreshTokenTtl リフレッシュトークンの有効期間
     */
    public record Jwt(
            String secret,
            @DefaultValue("spring-web-ai-samples") String issuer,
            @DefaultValue("1h") Duration accessTokenTtl,
            @DefaultValue("7d") Duration refreshTokenTtl) {
    }

    /**
     * CORS の設定。
     *
     * @param allowedOrigins 許可するオリジン（空なら他オリジンからの呼び出しを許可しない）
     */
    public record Cors(@DefaultValue List<String> allowedOrigins) {

        /** オリジン一覧を不変コピーとして保持する。 */
        public Cors {
            allowedOrigins = List.copyOf(allowedOrigins);
        }
    }
}
