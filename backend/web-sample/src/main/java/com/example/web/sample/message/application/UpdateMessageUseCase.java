package com.example.web.sample.message.application;

import com.example.web.sample.message.domain.DuplicateMessageCodeException;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageNotFoundException;
import com.example.web.sample.message.domain.MessageRepository;
import java.time.Clock;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** メッセージのコードと本文を更新する。 */
@Service
public class UpdateMessageUseCase {

    private final MessageRepository messageRepository;
    private final Clock clock;

    /**
     * ユースケースを生成する。
     *
     * @param messageRepository メッセージのリポジトリ
     * @param clock 時刻の取得元
     */
    public UpdateMessageUseCase(MessageRepository messageRepository, Clock clock) {
        this.messageRepository = messageRepository;
        this.clock = clock;
    }

    /**
     * メッセージを更新する。
     *
     * @param id メッセージ ID
     * @param code 新しいコード
     * @param content 新しい本文
     * @return 更新後のメッセージ
     * @throws MessageNotFoundException 存在しない場合
     * @throws DuplicateMessageCodeException 新しいコードが他のメッセージで使われている場合
     */
    @Transactional
    public Message execute(long id, String code, String content) {
        Message current = messageRepository.findById(id).orElseThrow(() -> new MessageNotFoundException(id));
        if (current.isCodeChangedTo(code) && messageRepository.existsByCode(code)) {
            throw new DuplicateMessageCodeException(code);
        }
        Message updated = current.update(code, content, OffsetDateTime.now(clock));
        messageRepository.update(updated);
        return updated;
    }
}
