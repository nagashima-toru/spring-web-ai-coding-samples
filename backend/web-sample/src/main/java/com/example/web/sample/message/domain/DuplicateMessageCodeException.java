package com.example.web.sample.message.domain;

import com.example.web.core.exception.ResourceConflictException;

/** メッセージコードが既に使われている。 */
public class DuplicateMessageCodeException extends ResourceConflictException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param code メッセージコード
     */
    public DuplicateMessageCodeException(String code) {
        super("メッセージコードは既に使われています: " + code);
    }
}
