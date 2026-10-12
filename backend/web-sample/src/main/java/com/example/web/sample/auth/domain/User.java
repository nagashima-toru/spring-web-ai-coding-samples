package com.example.web.sample.auth.domain;

/**
 * 利用者。
 *
 * @param id 利用者 ID
 * @param username ユーザー名（一意）
 * @param passwordHash パスワードのハッシュ（BCrypt）
 * @param role ロール
 * @param enabled 有効か（無効な利用者はログインできない）
 */
public record User(Long id, String username, String passwordHash, Role role, boolean enabled) {
}
