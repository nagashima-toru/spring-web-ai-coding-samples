package com.example.web.core.security;

import java.util.Set;

/**
 * 検証済みトークンから取り出した内容。
 *
 * @param subject 主体（ユーザー名）
 * @param type トークン種別
 * @param roles ロール（{@code ROLE_} 接頭辞なし。リフレッシュトークンでは空）
 */
public record TokenClaims(String subject, TokenType type, Set<String> roles) {

    /** ロールを不変コピーとして保持する。 */
    public TokenClaims {
        roles = Set.copyOf(roles);
    }
}
