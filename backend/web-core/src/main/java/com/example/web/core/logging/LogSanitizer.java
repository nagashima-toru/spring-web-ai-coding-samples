package com.example.web.core.logging;

/**
 * ログ出力前に利用者入力を無害化するユーティリティ（ログインジェクション対策）。
 *
 * <p>使い方: 利用者が制御できる値（リクエストパラメータ・ユーザー名など）をログに出す時は
 * 必ず {@link #sanitize(String)} を通す。</p>
 */
public final class LogSanitizer {

    private LogSanitizer() {
    }

    /**
     * 改行・タブなどの制御文字を {@code _} に置き換える。
     *
     * @param input 無害化する文字列（null 可）
     * @return 無害化した文字列。null の場合は {@code "null"}
     */
    public static String sanitize(String input) {
        if (input == null) {
            return "null";
        }
        return input.replaceAll("\\p{Cntrl}", "_");
    }
}
