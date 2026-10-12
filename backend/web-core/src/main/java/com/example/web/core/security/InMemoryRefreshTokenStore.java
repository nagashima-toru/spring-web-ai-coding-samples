package com.example.web.core.security;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** メモリに保持する {@link RefreshTokenStore} の実装（ローカル開発・単一タスク運用向け）。 */
public class InMemoryRefreshTokenStore implements RefreshTokenStore {

    private final Map<String, String> subjects = new ConcurrentHashMap<>();

    @Override
    public void save(String token, String subject) {
        subjects.put(token, subject);
    }

    @Override
    public Optional<String> findSubject(String token) {
        return Optional.ofNullable(subjects.get(token));
    }

    @Override
    public void remove(String token) {
        subjects.remove(token);
    }
}
