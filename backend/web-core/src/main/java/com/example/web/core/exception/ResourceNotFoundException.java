package com.example.web.core.exception;

/**
 * 対象リソースが存在しないことを表す業務例外（HTTP 404）。
 *
 * <p>使い方: 業務機能ごとにサブクラスを定義し、識別子を含むメッセージを渡す
 * （例: {@code MessageNotFoundException}）。</p>
 */
public class ResourceNotFoundException extends BusinessException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param message 利用者に返す詳細メッセージ
     */
    public ResourceNotFoundException(String message) {
        super("not-found", message);
    }
}
