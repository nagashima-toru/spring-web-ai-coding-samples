package com.example.web.core.exception;

/**
 * 環境・外部要因によるエラーを表す例外（HTTP 500）。
 *
 * <p>用途: DB・外部 API の障害など、利用者の操作では解消できないエラーを表す。
 * 詳細はログにだけ出し、利用者には定型メッセージを返す。</p>
 *
 * <p>使い方: 下位の例外を catch して変換する場合は、必ず cause を渡す。</p>
 */
public class SystemException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param message ログ用の詳細メッセージ
     * @param cause 原因となった例外
     */
    public SystemException(String message, Throwable cause) {
        super(message, cause);
    }
}
