package com.example.web.core.exception;

/**
 * Bean Validation では表現できない入力不正（ドメインの不変条件違反など）を表す業務例外（HTTP 400）。
 *
 * <p>使い方: ドメインモデルの生成・更新時の検証で送出する。単項目チェックは OpenAPI 定義の
 * 制約（Bean Validation）で行い、本例外は使わない。</p>
 */
public class InvalidInputException extends BusinessException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param message 利用者に返す詳細メッセージ
     */
    public InvalidInputException(String message) {
        super("invalid-input", message);
    }
}
