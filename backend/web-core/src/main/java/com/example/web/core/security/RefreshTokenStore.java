package com.example.web.core.security;

import java.util.Optional;

/**
 * 発行済みリフレッシュトークンの保管庫。ログアウトしたトークンを再利用できないようにする。
 *
 * <p>既定の実装 {@link InMemoryRefreshTokenStore} はアプリのメモリに保持するため、再起動で消え、
 * 複数タスクで共有できない。</p>
 *
 * <p>拡張ポイント: 複数タスクで運用する場合は DB や Redis を使う実装の Bean に差し替える。</p>
 */
public interface RefreshTokenStore {

    /**
     * トークンを保管する。
     *
     * @param token リフレッシュトークン
     * @param subject 主体（ユーザー名）
     */
    void save(String token, String subject);

    /**
     * トークンの主体を返す。
     *
     * @param token リフレッシュトークン
     * @return 保管されていれば主体。無ければ空
     */
    Optional<String> findSubject(String token);

    /**
     * トークンを破棄する（無ければ何もしない）。
     *
     * @param token リフレッシュトークン
     */
    void remove(String token);
}
