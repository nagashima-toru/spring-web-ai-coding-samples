package com.example.web.sample.message.presentation;

import com.example.web.core.paging.PageQuery;
import com.example.web.core.paging.PageResult;
import com.example.web.sample.generated.api.MessageApi;
import com.example.web.sample.generated.model.MessagePage;
import com.example.web.sample.generated.model.MessagePagePage;
import com.example.web.sample.generated.model.MessageRequest;
import com.example.web.sample.generated.model.MessageResponse;
import com.example.web.sample.message.application.CreateMessageUseCase;
import com.example.web.sample.message.application.DeleteMessageUseCase;
import com.example.web.sample.message.application.GetMessageUseCase;
import com.example.web.sample.message.application.GetMessagesUseCase;
import com.example.web.sample.message.application.UpdateMessageUseCase;
import com.example.web.sample.message.domain.Message;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * メッセージ API（OpenAPI 定義から生成した {@link MessageApi} の実装）。
 *
 * <p>認可: 参照は ADMIN・VIEWER、登録・更新・削除は ADMIN のみ。</p>
 */
@RestController
public class MessageController implements MessageApi {

    private final GetMessagesUseCase getMessagesUseCase;
    private final GetMessageUseCase getMessageUseCase;
    private final CreateMessageUseCase createMessageUseCase;
    private final UpdateMessageUseCase updateMessageUseCase;
    private final DeleteMessageUseCase deleteMessageUseCase;

    /**
     * Controller を生成する。
     *
     * @param getMessagesUseCase 一覧取得
     * @param getMessageUseCase 1件取得
     * @param createMessageUseCase 登録
     * @param updateMessageUseCase 更新
     * @param deleteMessageUseCase 削除
     */
    public MessageController(GetMessagesUseCase getMessagesUseCase, GetMessageUseCase getMessageUseCase,
            CreateMessageUseCase createMessageUseCase, UpdateMessageUseCase updateMessageUseCase,
            DeleteMessageUseCase deleteMessageUseCase) {
        this.getMessagesUseCase = getMessagesUseCase;
        this.getMessageUseCase = getMessageUseCase;
        this.createMessageUseCase = createMessageUseCase;
        this.updateMessageUseCase = updateMessageUseCase;
        this.deleteMessageUseCase = deleteMessageUseCase;
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    public ResponseEntity<MessagePage> getAllMessages(Integer page, Integer size) {
        PageResult<Message> result = getMessagesUseCase.execute(new PageQuery(page, size));
        MessagePagePage pageInfo = new MessagePagePage(result.size(), result.page(), result.totalElements(),
                result.totalPages());
        return ResponseEntity.ok(new MessagePage(result.map(MessageController::toResponse).content(), pageInfo));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'VIEWER')")
    public ResponseEntity<MessageResponse> getMessageById(Long id) {
        return ResponseEntity.ok(toResponse(getMessageUseCase.execute(id)));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> createMessage(MessageRequest request) {
        Message created = createMessageUseCase.execute(request.getCode(), request.getContent());
        URI location = UriComponentsBuilder.fromPath(PATH_GET_MESSAGE_BY_ID).buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(toResponse(created));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateMessage(Long id, MessageRequest request) {
        return ResponseEntity.ok(toResponse(updateMessageUseCase.execute(id, request.getCode(), request.getContent())));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(Long id) {
        deleteMessageUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }

    private static MessageResponse toResponse(Message message) {
        return new MessageResponse(message.id(), message.code(), message.content(), message.createdAt(),
                message.updatedAt());
    }
}
