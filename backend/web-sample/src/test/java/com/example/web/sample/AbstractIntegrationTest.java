package com.example.web.sample;

import com.example.web.core.security.TokenProvider;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * API 結合テストの基底クラス。
 *
 * <p>本番同一バージョンの PostgreSQL 16 コンテナ（Testcontainers）を全テストで共有し、Flyway で
 * マイグレーションした実 DB に対して MockMvc で API を呼ぶ。テストデータは各テストの前に初期化し、
 * 利用者 {@code admin}（ADMIN）・{@code viewer}（VIEWER）・{@code disabled}（無効）を投入する。</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    /** テスト用利用者の共通パスワード。 */
    protected static final String PASSWORD = "password123";

    /** 全テストクラスで共有する PostgreSQL（起動コスト削減）。 */
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16");

    static {
        POSTGRES.start();
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected TokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetData() {
        jdbcTemplate.execute("TRUNCATE TABLE app.messages, app.users RESTART IDENTITY");
        String hash = passwordEncoder.encode(PASSWORD);
        jdbcTemplate.update("INSERT INTO app.users (username, password_hash, role, enabled) VALUES "
                + "('admin', ?, 'ADMIN', TRUE), ('viewer', ?, 'VIEWER', TRUE), ('disabled', ?, 'ADMIN', FALSE)",
                hash, hash, hash);
    }

    /**
     * 指定ロールのアクセストークンを Authorization ヘッダ値で返す。
     *
     * @param username ユーザー名
     * @param role ロール
     * @return {@code Bearer ...}
     */
    protected String bearer(String username, String role) {
        return "Bearer " + tokenProvider.createAccessToken(username, List.of(role));
    }
}
