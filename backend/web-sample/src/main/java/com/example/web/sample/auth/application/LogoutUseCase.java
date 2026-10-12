package com.example.web.sample.auth.application;

import com.example.web.core.security.RefreshTokenStore;
import org.springframework.stereotype.Service;

/**
 * ログアウト。リフレッシュトークンを破棄し、以後のトークン再発行をできなくする。
 *
 * <p>発行済みのアクセストークンは有効期限まで使える（ステートレス認証のため）。有効期間を短く保つこと。</p>
 */
@Service
public class LogoutUseCase {

    private final RefreshTokenStore refreshTokenStore;

    /**
     * ユースケースを生成する。
     *
     * @param refreshTokenStore リフレッシュトークンの保管庫
     */
    public LogoutUseCase(RefreshTokenStore refreshTokenStore) {
        this.refreshTokenStore = refreshTokenStore;
    }

    /**
     * ログアウトする。
     *
     * @param refreshToken リフレッシュトークン
     */
    public void execute(String refreshToken) {
        refreshTokenStore.remove(refreshToken);
    }
}
