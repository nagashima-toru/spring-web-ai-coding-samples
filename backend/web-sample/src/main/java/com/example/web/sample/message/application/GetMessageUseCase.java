package com.example.web.sample.message.application;

import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** メッセージを1件取得する。 */
@Service
public class GetMessageUseCase {

    private final MessageRepository messageRepository;

    /**
     * ユースケースを生成する。
     *
     * @param messageRepository メッセージのリポジトリ
     */
    public GetMessageUseCase(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * メッセージを取得する。
     *
     * @param id メッセージ ID
     * @return メッセージ
     * @throws MessageNotFoundException 存在しない場合
     */
    @Transactional(readOnly = true)
    public Message execute(long id) {
        return messageRepository.findById(id).orElseThrow(() -> new MessageNotFoundException(id));
    }
}
