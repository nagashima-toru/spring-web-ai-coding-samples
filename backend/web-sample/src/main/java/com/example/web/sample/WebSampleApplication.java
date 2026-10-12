package com.example.web.sample;

import com.example.web.core.config.EnableWebCore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** サンプル業務アプリケーションの起動クラス。 */
@SpringBootApplication
@EnableWebCore
public class WebSampleApplication {

    /**
     * アプリケーションを起動する。
     *
     * @param args 起動引数
     */
    public static void main(String[] args) {
        SpringApplication.run(WebSampleApplication.class, args);
    }
}
