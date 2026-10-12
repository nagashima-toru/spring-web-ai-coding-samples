package com.example.web.core.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-for-unit-tests-0123456789";
    private static final Instant NOW = Instant.parse("2026-01-01T00:00:00Z");
    private static final SecurityProperties.Jwt SETTINGS =
            new SecurityProperties.Jwt(SECRET, "test-issuer", Duration.ofHours(1), Duration.ofDays(7));

    private final JwtTokenProvider provider = providerAt(NOW);

    @Test
    void アクセストークン_主体とロールと種別を取り出せる() {
        String token = provider.createAccessToken("admin", List.of("ADMIN"));

        assertThat(provider.parse(token))
                .contains(new TokenClaims("admin", TokenType.ACCESS, Set.of("ADMIN")));
    }

    @Test
    void リフレッシュトークン_種別はREFRESHでロールは空() {
        String token = provider.createRefreshToken("admin");

        assertThat(provider.parse(token)).contains(new TokenClaims("admin", TokenType.REFRESH, Set.of()));
    }

    @Test
    void リフレッシュトークンを2回発行_毎回異なる値になる() {
        assertThat(provider.createRefreshToken("admin")).isNotEqualTo(provider.createRefreshToken("admin"));
    }

    @Test
    void 有効期限切れ_空を返す() {
        String token = provider.createAccessToken("admin", List.of("ADMIN"));

        assertThat(providerAt(NOW.plus(Duration.ofHours(2))).parse(token)).isEmpty();
    }

    @Test
    void 改ざんされたトークン_空を返す() {
        String token = provider.createAccessToken("admin", List.of("ADMIN"));

        assertThat(provider.parse(token + "x")).isEmpty();
    }

    @Test
    void 発行者が異なる_空を返す() {
        var other = new JwtTokenProvider(
                new SecurityProperties.Jwt(SECRET, "other-issuer", Duration.ofHours(1), Duration.ofDays(7)),
                Clock.fixed(NOW, ZoneOffset.UTC));

        assertThat(provider.parse(other.createAccessToken("admin", List.of("ADMIN")))).isEmpty();
    }

    @Test
    void 種別クレームが無い_空を返す() {
        String token = Jwts.builder()
                .subject("admin")
                .issuer("test-issuer")
                .expiration(Date.from(NOW.plusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThat(provider.parse(token)).isEmpty();
    }

    @Test
    void JWT形式でない文字列_空を返す() {
        assertThat(provider.parse("not-a-jwt")).isEmpty();
    }

    @Test
    void 署名鍵が256bit未満_WeakKeyException() {
        var weak = new SecurityProperties.Jwt("short", "test-issuer", Duration.ofHours(1), Duration.ofDays(7));

        assertThatThrownBy(() -> new JwtTokenProvider(weak, Clock.systemUTC())).isInstanceOf(WeakKeyException.class);
    }

    @Test
    void アクセストークンの有効期間_設定値を返す() {
        assertThat(provider.accessTokenTtl()).isEqualTo(Duration.ofHours(1));
    }

    private static JwtTokenProvider providerAt(Instant instant) {
        return new JwtTokenProvider(SETTINGS, Clock.fixed(instant, ZoneOffset.UTC));
    }
}
