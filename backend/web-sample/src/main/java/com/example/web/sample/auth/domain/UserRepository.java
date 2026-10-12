package com.example.web.sample.auth.domain;

import java.util.Optional;

/** 利用者のリポジトリ。 */
public interface UserRepository {

    /**
     * ユーザー名で利用者を探す。
     *
     * @param username ユーザー名
     * @return 見つかれば利用者
     */
    Optional<User> findByUsername(String username);
}
