package com.example.web.sample.auth.infrastructure;

import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/** {@link UserRepository} の MyBatis 実装。 */
@Repository
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    /**
     * リポジトリを生成する。
     *
     * @param userMapper 利用者の Mapper
     */
    public UserRepositoryImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(userMapper.findByUsername(username));
    }
}
