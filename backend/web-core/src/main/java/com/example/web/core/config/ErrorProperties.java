package com.example.web.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * 共通エラー応答の設定（接頭辞 {@code app.error}）。
 *
 * @param typeBaseUri エラー応答の type URI の接頭辞
 */
@ConfigurationProperties("app.error")
public record ErrorProperties(@DefaultValue("https://api.example.com/errors") String typeBaseUri) {
}
