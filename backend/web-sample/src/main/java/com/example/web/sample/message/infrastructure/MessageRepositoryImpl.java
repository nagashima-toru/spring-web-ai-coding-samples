package com.example.web.sample.message.infrastructure;

import com.example.web.core.paging.PageQuery;
import com.example.web.core.paging.PageResult;
import com.example.web.sample.message.domain.DuplicateMessageCodeException;
import com.example.web.sample.message.domain.Message;
import com.example.web.sample.message.domain.MessageRepository;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Repository;

/**
 * {@link MessageRepository} の MyBatis 実装。
 *
 * <p>コードの一意制約違反は、同時登録で事前チェックをすり抜けた場合にも起きうるため、
 * {@link DuplicateMessageCodeException} に変換する。</p>
 */
@Repository
public class MessageRepositoryImpl implements MessageRepository {

    private final MessageMapper messageMapper;

    /**
     * リポジトリを生成する。
     *
     * @param messageMapper メッセージの Mapper
     */
    public MessageRepositoryImpl(MessageMapper messageMapper) {
        this.messageMapper = messageMapper;
    }

    @Override
    public PageResult<Message> findPage(PageQuery query) {
        return PageResult.of(query, messageMapper.findPage(query.offset(), query.size()), messageMapper.count());
    }

    @Override
    public Optional<Message> findById(long id) {
        return Optional.ofNullable(messageMapper.findById(id));
    }

    @Override
    public boolean existsByCode(String code) {
        return messageMapper.existsByCode(code);
    }

    @Override
    public Message insert(Message message) {
        try {
            return message.withId(messageMapper.insert(message));
        } catch (DuplicateKeyException ex) {
            throw duplicate(message, ex);
        }
    }

    @Override
    public void update(Message message) {
        try {
            messageMapper.update(message);
        } catch (DuplicateKeyException ex) {
            throw duplicate(message, ex);
        }
    }

    @Override
    public boolean deleteById(long id) {
        return messageMapper.deleteById(id) > 0;
    }

    private static DuplicateMessageCodeException duplicate(Message message, DuplicateKeyException cause) {
        DuplicateMessageCodeException ex = new DuplicateMessageCodeException(message.code());
        ex.initCause(cause);
        return ex;
    }
}
