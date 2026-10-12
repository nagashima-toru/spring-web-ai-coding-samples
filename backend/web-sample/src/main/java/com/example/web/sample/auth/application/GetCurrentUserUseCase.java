package com.example.web.sample.auth.application;

import com.example.web.sample.auth.domain.User;
import com.example.web.sample.auth.domain.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

/**
 * ログイン中の利用者の情報を取得する。
 *
 * <p>トークン発行後に利用者が削除・無効化された場合は 401 にする（トークンだけを信用しない）。</p>
 */
@Service
public class GetCurrentUserUseCase {

    private final UserRepository userRepository;

    /**
     * ユースケースを生成する。
     *
     * @param userRepository 利用者のリポジトリ
     */
    public GetCurrentUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 利用者を取得する。
     *
     * @param username 認証済みのユーザー名
     * @return 利用者
     * @throws BadCredentialsException 利用者が存在しない、または無効な場合
     */
    public User execute(String username) {
        return userRepository.findByUsername(username)
                .filter(User::enabled)
                .orElseThrow(() -> new BadCredentialsException("利用者が見つかりません"));
    }
}
