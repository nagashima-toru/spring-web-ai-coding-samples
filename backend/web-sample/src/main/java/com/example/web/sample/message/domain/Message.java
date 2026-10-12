package com.example.web.sample.message.domain;

import com.example.web.core.exception.InvalidInputException;
import java.time.OffsetDateTime;

/**
 * メッセージ。コード（一意）と本文を持つ。
 *
 * <p>生成・更新は {@link #create} / {@link #update} を使い、不変条件（必須・長さ）を必ず検証する。</p>
 *
 * @param id メッセージ ID（未登録なら null）
 * @param code メッセージコード
 * @param content 本文
 * @param createdAt 作成日時
 * @param updatedAt 更新日時
 */
public record Message(Long id, String code, String content, OffsetDateTime createdAt, OffsetDateTime updatedAt) {

    /** コードの最大長。 */
    public static final int MAX_CODE_LENGTH = 50;

    /** 本文の最大長。 */
    public static final int MAX_CONTENT_LENGTH = 255;

    /**
     * 未登録のメッセージを生成する。
     *
     * @param code メッセージコード
     * @param content 本文
     * @param now 現在日時
     * @return 未登録のメッセージ
     * @throws InvalidInputException 不変条件を満たさない場合
     */
    public static Message create(String code, String content, OffsetDateTime now) {
        validate(code, content);
        return new Message(null, code, content, now, now);
    }

    /**
     * コードと本文を変更したメッセージを返す。
     *
     * @param newCode 新しいコード
     * @param newContent 新しい本文
     * @param now 現在日時
     * @return 変更後のメッセージ
     * @throws InvalidInputException 不変条件を満たさない場合
     */
    public Message update(String newCode, String newContent, OffsetDateTime now) {
        validate(newCode, newContent);
        return new Message(id, newCode, newContent, createdAt, now);
    }

    /**
     * ID を付与したメッセージを返す。
     *
     * @param newId 採番された ID
     * @return ID 付きのメッセージ
     */
    public Message withId(long newId) {
        return new Message(newId, code, content, createdAt, updatedAt);
    }

    /**
     * コードが変わるかを返す。
     *
     * @param otherCode 比較するコード
     * @return 変わるなら true
     */
    public boolean isCodeChangedTo(String otherCode) {
        return !code.equals(otherCode);
    }

    private static void validate(String code, String content) {
        requireText("コード", code, MAX_CODE_LENGTH);
        requireText("本文", content, MAX_CONTENT_LENGTH);
    }

    private static void requireText(String name, String value, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new InvalidInputException(name + "は必須です");
        }
        if (value.length() > maxLength) {
            throw new InvalidInputException(name + "は" + maxLength + "文字以内で入力してください");
        }
    }
}
