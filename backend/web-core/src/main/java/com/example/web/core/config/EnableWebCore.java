package com.example.web.core.config;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.context.annotation.Import;

/**
 * web-core の基盤部品を有効にする。
 *
 * <p>使い方: アプリケーションの起動クラスに付ける。</p>
 *
 * <pre>{@code
 * @SpringBootApplication
 * @EnableWebCore
 * public class MyApplication { ... }
 * }</pre>
 *
 * <p>自動構成ではなく明示 import にしているのは、Spring Boot 既定の {@code SecurityFilterChain} より
 * 確実に先に登録させるため（自動構成どうしの順序に依存しない）。</p>
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({WebCoreConfiguration.class, WebSecurityConfiguration.class})
public @interface EnableWebCore {
}
