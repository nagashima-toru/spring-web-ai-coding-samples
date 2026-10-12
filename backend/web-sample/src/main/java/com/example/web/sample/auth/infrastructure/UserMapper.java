package com.example.web.sample.auth.infrastructure;

import com.example.web.sample.auth.domain.User;
import org.apache.ibatis.annotations.Mapper;

/** 利用者テーブル（{@code app.users}）の MyBatis Mapper。SQL は {@code mapper/UserMapper.xml}。 */
@Mapper
public interface UserMapper {

    /**
     * ユーザー名で利用者を取得する。
     *
     * @param username ユーザー名
     * @return 利用者（無ければ null）
     */
    User findByUsername(String username);
}
