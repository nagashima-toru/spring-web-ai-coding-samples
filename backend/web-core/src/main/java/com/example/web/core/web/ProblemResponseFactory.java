package com.example.web.core.web;

import com.example.web.core.web.ProblemResponse.FieldViolation;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatusCode;

/**
 * {@link ProblemResponse} を組み立てる部品。
 *
 * <p>type URI は {@code app.error.type-base-uri}（既定 {@code https://api.example.com/errors}）に
 * エラー種別を連結して作る。発生日時は {@link Clock} から取る（テストで固定できるようにするため）。</p>
 */
public class ProblemResponseFactory {

    private final String typeBaseUri;
    private final Clock clock;

    /**
     * 部品を生成する。
     *
     * @param typeBaseUri type URI の接頭辞
     * @param clock 発生日時の取得元
     */
    public ProblemResponseFactory(String typeBaseUri, Clock clock) {
        this.typeBaseUri = typeBaseUri;
        this.clock = clock;
    }

    /**
     * エラー応答を組み立てる。
     *
     * @param status HTTP ステータス
     * @param errorType エラー種別（小文字ケバブケース）
     * @param detail 詳細説明
     * @param instance リクエスト URI
     * @return エラー応答
     */
    public ProblemResponse create(HttpStatusCode status, String errorType, String detail, String instance) {
        return create(status, errorType, detail, instance, null);
    }

    /**
     * 項目ごとの入力エラー付きのエラー応答を組み立てる。
     *
     * @param status HTTP ステータス
     * @param errorType エラー種別（小文字ケバブケース）
     * @param detail 詳細説明
     * @param instance リクエスト URI
     * @param errors 項目ごとの入力エラー（無ければ null）
     * @return エラー応答
     */
    public ProblemResponse create(HttpStatusCode status, String errorType, String detail, String instance,
            List<FieldViolation> errors) {
        return new ProblemResponse(
                typeBaseUri + "/" + errorType,
                reasonPhrase(status),
                status.value(),
                detail,
                instance,
                OffsetDateTime.now(clock),
                errors);
    }

    private static String reasonPhrase(HttpStatusCode status) {
        if (status instanceof org.springframework.http.HttpStatus known) {
            return known.getReasonPhrase();
        }
        return "HTTP " + status.value();
    }
}
