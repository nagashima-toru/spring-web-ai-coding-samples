package com.example.web.sample.message.domain;

import com.example.web.core.paging.PageQuery;
import com.example.web.core.paging.PageResult;
import java.util.Optional;

/** メッセージのリポジトリ。 */
public interface MessageRepository {

    /**
     * 作成日時の新しい順に1ページ分を取得する。
     *
     * @param query ページング条件
     * @return ページング結果
     */
    PageResult<Message> findPage(PageQuery query);

    /**
     * ID でメッセージを探す。
     *
     * @param id メッセージ ID
     * @return 見つかればメッセージ
     */
    Optional<Message> findById(long id);

    /**
     * コードが使われているかを返す。
     *
     * @param code メッセージコード
     * @return 使われていれば true
     */
    boolean existsByCode(String code);

    /**
     * メッセージを登録する。
     *
     * @param message 未登録のメッセージ
     * @return ID を付与したメッセージ
     * @throws DuplicateMessageCodeException コードが重複した場合
     */
    Message insert(Message message);

    /**
     * メッセージを更新する。
     *
     * @param message 登録済みのメッセージ
     * @throws DuplicateMessageCodeException コードが重複した場合
     */
    void update(Message message);

    /**
     * メッセージを削除する。
     *
     * @param id メッセージ ID
     * @return 削除したら true（存在しなければ false）
     */
    boolean deleteById(long id);
}
