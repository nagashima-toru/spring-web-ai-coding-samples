package com.example.web.core.security;

import java.time.Duration;
import java.util.Collection;
import java.util.Optional;

/**
 * トークンの発行と検証を行う部品。
 *
 * <p>用途: ログイン・トークン再発行のユースケースがトークンを発行し、{@link JwtAuthenticationFilter} が検証する。
 * 既定の実装は {@link JwtTokenProvider}。</p>
 *
 * <p>拡張ポイント: 外部 IdP のトークンを使う場合は本インタフェースを実装した Bean に差し替える。</p>
 */
public interface TokenProvider {

    /**
     * アクセストークンを発行する。
     *
     * @param subject 主体（ユーザー名）
     * @param roles ロール（{@code ROLE_} 接頭辞なし）
     * @return アクセストークン
     */
    String createAccessToken(String subject, Collection<String> roles);

    /**
     * リフレッシュトークンを発行する。発行のたびに異なる値になる。
     *
     * @param subject 主体（ユーザー名）
     * @return リフレッシュトークン
     */
    String createRefreshToken(String subject);

    /**
     * トークンを検証して内容を取り出す。
     *
     * @param token トークン
     * @return 署名・有効期限・発行者が正しければ内容。不正なら空
     */
    Optional<TokenClaims> parse(String token);

    /**
     * アクセストークンの有効期間を返す。
     *
     * @return 有効期間
     */
    Duration accessTokenTtl();
}
