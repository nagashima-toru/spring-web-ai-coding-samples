package com.example.web.sample.message.domain;

import com.example.web.core.exception.ResourceNotFoundException;

/** 指定した ID のメッセージが存在しない。 */
public class MessageNotFoundException extends ResourceNotFoundException {

    private static final long serialVersionUID = 1L;

    /**
     * 例外を生成する。
     *
     * @param id メッセージ ID
     */
    public MessageNotFoundException(long id) {
        super("メッセージが見つかりません（ID: " + id + "）");
    }
}
