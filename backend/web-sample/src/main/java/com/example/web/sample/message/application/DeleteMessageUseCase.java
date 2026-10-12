package com.example.web.sample.message.application;

import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** メッセージを削除する。 */
@Service
public class DeleteMessageUseCase {

    private final MessageRepository messageRepository;

    /**
     * ユースケースを生成する。
     *
     * @param messageRepository メッセージのリポジトリ
     */
    public DeleteMessageUseCase(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * メッセージを削除する。
     *
     * @param id メッセージ ID
     * @throws MessageNotFoundException 存在しない場合
     */
    @Transactional
    public void execute(long id) {
        if (!messageRepository.deleteById(id)) {
            throw new MessageNotFoundException(id);
        }
    }
}
