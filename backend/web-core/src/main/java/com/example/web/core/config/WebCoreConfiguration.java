package com.example.web.core.config;

import com.example.web.core.web.GlobalExceptionHandler;
import com.example.web.core.web.ProblemResponseFactory;
import com.example.web.core.web.ProblemResponseWriter;
import java.time.Clock;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

/**
 * 共通部品（時刻・共通エラー応答・例外ハンドラ）の Bean 定義。{@link EnableWebCore} から読み込まれる。
 *
 * <p>拡張ポイント: テストで時刻を固定する場合は {@link Clock} Bean を {@code @MockitoBean} 等で差し替える。</p>
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ErrorProperties.class)
public class WebCoreConfiguration {

    /**
     * 業務で使う時刻の取得元。{@code LocalDateTime.now()} を直接呼ばず、この Bean から取る。
     *
     * @return システム既定タイムゾーンの時計
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }

    /**
     * 共通エラー応答の組み立て部品。
     *
     * @param properties エラー応答の設定
     * @param clock 時刻の取得元
     * @return 組み立て部品
     */
    @Bean
    public ProblemResponseFactory problemResponseFactory(ErrorProperties properties, Clock clock) {
        return new ProblemResponseFactory(properties.typeBaseUri(), clock);
    }

    /**
     * 共通エラー応答の書き出し部品。
     *
     * @param jsonMapper Spring Boot が構成した JSON Mapper
     * @return 書き出し部品
     */
    @Bean
    public ProblemResponseWriter problemResponseWriter(JsonMapper jsonMapper) {
        return new ProblemResponseWriter(jsonMapper);
    }

    /**
     * 例外を共通エラー応答に変換するハンドラ。
     *
     * @param factory 組み立て部品
     * @return 例外ハンドラ
     */
    @Bean
    public GlobalExceptionHandler globalExceptionHandler(ProblemResponseFactory factory) {
        return new GlobalExceptionHandler(factory);
    }
}
