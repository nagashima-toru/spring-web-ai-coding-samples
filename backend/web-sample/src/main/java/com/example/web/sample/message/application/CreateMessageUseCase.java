package com.example.web.sample.message.application;

import com.example.web.sample.message.domain.DuplicateMessageCodeException;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageRepository;
import java.time.Clock;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** メッセージを登録する。コードは一意。 */
@Service
public class CreateMessageUseCase {

    private final MessageRepository messageRepository;
    private final Clock clock;

    /**
     * ユースケースを生成する。
     *
     * @param messageRepository メッセージのリポジトリ
     * @param clock 時刻の取得元
     */
    public CreateMessageUseCase(MessageRepository messageRepository, Clock clock) {
        this.messageRepository = messageRepository;
        this.clock = clock;
    }

    /**
     * メッセージを登録する。
     *
     * @param code メッセージコード
     * @param content 本文
     * @return 登録したメッセージ
     * @throws DuplicateMessageCodeException コードが既に使われている場合
     */
    @Transactional
    public Message execute(String code, String content) {
        if (messageRepository.existsByCode(code)) {
            throw new DuplicateMessageCodeException(code);
        }
        return messageRepository.insert(Message.create(code, content, OffsetDateTime.now(clock)));
    }
}
