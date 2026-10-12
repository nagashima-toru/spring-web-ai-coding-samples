package com.example.web.sample.message.application;

import com.example.web.core.paging.PageQuery;
import com.example.web.core.paging.PageResult;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** メッセージ一覧を作成日時の新しい順にページ単位で取得する。 */
@Service
public class GetMessagesUseCase {

    private final MessageRepository messageRepository;

    /**
     * ユースケースを生成する。
     *
     * @param messageRepository メッセージのリポジトリ
     */
    public GetMessagesUseCase(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * 一覧を取得する。
     *
     * @param query ページング条件
     * @return ページング結果
     */
    @Transactional(readOnly = true)
    public PageResult<Message> execute(PageQuery query) {
        return messageRepository.findPage(query);
    }
}
