package com.example.web.sample.auth.application;

import java.time.Duration;

/**
 * ログイン・トークン再発行の結果。
 *
 * @param accessToken アクセストークン
 * @param refreshToken リフレッシュトークン
 * @param expiresIn アクセストークンの有効期間
 */
public record AuthTokens(String accessToken, String refreshToken, Duration expiresIn) {
}
