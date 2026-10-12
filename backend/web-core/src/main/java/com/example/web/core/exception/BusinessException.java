package com.example.web.core.exception;

/**
 * 業務エラーの基底例外。
 *
 * <p>用途: 利用者の入力や業務ルールに起因し、利用者に理由を伝えるべきエラーを表す。
 * {@link com.example.web.core.web.GlobalExceptionHandler} が HTTP 4xx の共通エラー応答に変換する。</p>
 *
 * <p>使い方: 業務機能では直接使わず、目的に合うサブクラス（{@link ResourceNotFoundException}・
 * {@link ResourceConflictException}・{@link InvalidInputException}）を継承した例外を定義する。</p>
 *
 * <p>拡張ポイント: 新しい HTTP ステータスに対応させる場合は、本クラスのサブクラスを web-core に追加し、
 * {@link com.example.web.core.web.GlobalExceptionHandler} にハンドラを追加する。</p>
 */
public abstract class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** エラー種別（エラー応答の type URI の末尾。例: {@code not-found}）。 */
    private final String errorType;

    /**
     * 業務例外を生成する。
     *
     * @param errorType エラー種別（小文字ケバブケース）
     * @param message 利用者に返す詳細メッセージ
     */
    protected BusinessException(String errorType, String message) {
        super(message);
        this.errorType = errorType;
    }

    /**
     * エラー種別を返す。
     *
     * @return エラー種別
     */
    public String getErrorType() {
        return errorType;
    }
}
