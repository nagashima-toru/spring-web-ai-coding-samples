package com.example.web.core.config;

import com.example.web.core.security.InMemoryRefreshTokenStore;
import com.example.web.core.security.JwtAuthenticationFilter;
import com.example.web.core.security.JwtTokenProvider;
import com.example.web.core.security.ProblemAccessDeniedHandler;
import com.example.web.core.security.ProblemAuthenticationEntryPoint;
import com.example.web.core.security.RefreshTokenStore;
import com.example.web.core.security.SecurityProperties;
import com.example.web.core.security.TokenProvider;
import com.example.web.core.web.ProblemResponseFactory;
import com.example.web.core.web.ProblemResponseWriter;
import java.time.Clock;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * JWT によるステートレス認証の Security 設定。{@link EnableWebCore} から読み込まれる。
 *
 * <p>方針: {@code app.security.public-paths} 以外のパスは認証必須。ロールによる認可は Controller の
 * {@code @PreAuthorize} で行う。エラー応答はすべて共通形式（{@code application/problem+json}）。</p>
 *
 * <p>アプリケーション側の前提: ログインに使う {@code UserDetailsService} の Bean を定義すること
 * （{@link AuthenticationManager} がそれとパスワードエンコーダで認証する）。</p>
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class WebSecurityConfiguration {

    /**
     * Security フィルタチェーン。
     *
     * @param http 設定ビルダー
     * @param properties 認証・認可の設定
     * @param tokenProvider トークンの検証に使う部品
     * @param factory エラー応答の組み立て部品
     * @param writer エラー応答の書き出し部品
     * @return フィルタチェーン
     * @throws Exception 設定に失敗した場合
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityProperties properties,
            TokenProvider tokenProvider, ProblemResponseFactory factory, ProblemResponseWriter writer)
            throws Exception {
        String[] publicPaths = properties.publicPaths().toArray(String[]::new);
        // CSRF 対策は無効にする。認証情報を Cookie ではなく Authorization ヘッダで送るため、CSRF の前提が成り立たない
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource(properties.cors().allowedOrigins())))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(publicPaths).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new ProblemAuthenticationEntryPoint(factory, writer))
                        .accessDeniedHandler(new ProblemAccessDeniedHandler(factory, writer)))
                .addFilterBefore(new JwtAuthenticationFilter(tokenProvider),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * JWT の発行・検証部品。
     *
     * @param properties 認証・認可の設定
     * @param clock 時刻の取得元
     * @return トークン部品
     */
    @Bean
    public TokenProvider tokenProvider(SecurityProperties properties, Clock clock) {
        return new JwtTokenProvider(properties.jwt(), clock);
    }

    /**
     * リフレッシュトークンの保管庫（既定はメモリ保持）。
     *
     * @return 保管庫
     */
    @Bean
    public RefreshTokenStore refreshTokenStore() {
        return new InMemoryRefreshTokenStore();
    }

    /**
     * パスワードのハッシュ化方式（BCrypt）。
     *
     * @return パスワードエンコーダ
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * ログインの認証に使う {@link AuthenticationManager}。
     *
     * @param configuration Spring Security の認証設定
     * @return 認証マネージャ
     * @throws Exception 取得に失敗した場合
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    private static CorsConfigurationSource corsConfigurationSource(List<String> allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept-Language"));
        configuration.setExposedHeaders(List.of("Location"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
