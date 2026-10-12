package com.example.web.core.exception;

/**
 * 一意制約違反など、リソースの現在の状態と競合することを表す業務例外（HTTP 409）。
 *
 * <p>使い方: 業務機能ごとにサブクラスを定義する（例: {@code DuplicateMessageCodeException}）。</p>
 */
public class ResourceConflictException extends BusinessException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param message 利用者に返す詳細メッセージ
     */
    public ResourceConflictException(String message) {
        super("conflict", message);
    }
}
