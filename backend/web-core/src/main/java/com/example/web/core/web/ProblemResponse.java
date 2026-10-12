package com.example.web.core.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * 共通エラー応答（RFC 9457 Problem Details 形式）。
 *
 * <p>すべてのエラー応答は {@code application/problem+json} でこの形式を返す。
 * 業務コードからは直接生成せず、例外を送出して {@link GlobalExceptionHandler} に変換させる。</p>
 *
 * @param type エラー種別を識別する URI
 * @param title エラーの概要（HTTP ステータスの理由句）
 * @param status HTTP ステータスコード
 * @param detail エラーの詳細説明
 * @param instance エラーが発生したリクエストの URI
 * @param timestamp エラー発生日時
 * @param errors 項目ごとの入力エラー（入力エラーの場合のみ）
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProblemResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        OffsetDateTime timestamp,
        List<FieldViolation> errors) {

    /** 項目ごとの入力エラーを不変コピーとして保持する。 */
    public ProblemResponse {
        errors = errors == null ? null : List.copyOf(errors);
    }

    /**
     * 項目ごとの入力エラー。
     *
     * @param field 項目名
     * @param rejectedValue 拒否された値
     * @param message エラーメッセージ
     */
    public record FieldViolation(String field, Object rejectedValue, String message) {
    }
}
