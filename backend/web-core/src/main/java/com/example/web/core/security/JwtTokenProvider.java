package com.example.web.core.security;

import com.example.web.core.logging.LogSanitizer;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * HMAC-SHA 署名の JWT で {@link TokenProvider} を実装する部品。
 *
 * <p>トークンには種別（{@code typ}）とロール（{@code roles}）のクレームを入れ、検証時に発行者と有効期限を確かめる。
 * 時刻は {@link Clock} から取る（テストで期限切れを再現できるようにするため）。</p>
 */
public class JwtTokenProvider implements TokenProvider {

    private static final Logger LOG = LoggerFactory.getLogger(JwtTokenProvider.class);

    private static final String CLAIM_TYPE = "typ";
    private static final String CLAIM_ROLES = "roles";

    private final SecretKey key;
    private final SecurityProperties.Jwt settings;
    private final Clock clock;
    private final JwtParser parser;

    /**
     * 部品を生成する。
     *
     * @param settings JWT の設定
     * @param clock 時刻の取得元
     * @throws io.jsonwebtoken.security.WeakKeyException 署名鍵が 256 bit 未満の場合
     */
    public JwtTokenProvider(SecurityProperties.Jwt settings, Clock clock) {
        this.key = Keys.hmacShaKeyFor(settings.secret().getBytes(StandardCharsets.UTF_8));
        this.settings = settings;
        this.clock = clock;
        this.parser = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(settings.issuer())
                .clock(() -> Date.from(clock.instant()))
                .build();
    }

    @Override
    public String createAccessToken(String subject, Collection<String> roles) {
        return build(subject, TokenType.ACCESS, List.copyOf(roles), settings.accessTokenTtl());
    }

    @Override
    public String createRefreshToken(String subject) {
        return build(subject, TokenType.REFRESH, List.of(), settings.refreshTokenTtl());
    }

    @Override
    public Optional<TokenClaims> parse(String token) {
        try {
            Claims claims = parser.parseSignedClaims(token).getPayload();
            String typeName = claims.get(CLAIM_TYPE, String.class);
            if (typeName == null || claims.getSubject() == null) {
                LOG.debug("トークンに必須クレーム（typ・sub）がありません");
                return Optional.empty();
            }
            List<?> roles = claims.get(CLAIM_ROLES, List.class);
            Set<String> roleNames = roles == null ? Set.of()
                    : Set.copyOf(roles.stream().map(String::valueOf).toList());
            return Optional.of(new TokenClaims(claims.getSubject(), TokenType.valueOf(typeName), roleNames));
        } catch (JwtException | IllegalArgumentException ex) {
            // 不正なトークンは「認証なし」として扱う。理由は調査用にデバッグログへ残す
            LOG.debug("トークンの検証に失敗: {}", LogSanitizer.sanitize(ex.getMessage()));
            return Optional.empty();
        }
    }

    @Override
    public Duration accessTokenTtl() {
        return settings.accessTokenTtl();
    }

    private String build(String subject, TokenType type, List<String> roles, Duration ttl) {
        Instant now = clock.instant();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(subject)
                .issuer(settings.issuer())
                .claim(CLAIM_TYPE, type.name())
                .claim(CLAIM_ROLES, roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }
}
