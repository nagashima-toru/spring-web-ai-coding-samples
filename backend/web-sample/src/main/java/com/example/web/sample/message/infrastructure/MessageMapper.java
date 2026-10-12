package com.example.web.sample.message.infrastructure;

import com.example.web.sample.message.domain.Message;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/** メッセージテーブル（{@code app.messages}）の MyBatis Mapper。SQL は {@code mapper/MessageMapper.xml}。 */
@Mapper
public interface MessageMapper {

    /**
     * 作成日時の新しい順に取得する。
     *
     * @param offset 読み飛ばし件数
     * @param limit 取得件数
     * @return メッセージ
     */
    List<Message> findPage(@Param("offset") long offset, @Param("limit") int limit);

    /**
     * 全件数を返す。
     *
     * @return 件数
     */
    long count();

    /**
     * ID で取得する。
     *
     * @param id メッセージ ID
     * @return メッセージ（無ければ null）
     */
    Message findById(long id);

    /**
     * コードが使われているかを返す。
     *
     * @param code メッセージコード
     * @return 使われていれば true
     */
    boolean existsByCode(String code);

    /**
     * 登録し、採番した ID を返す。
     *
     * @param message 未登録のメッセージ
     * @return 採番した ID
     */
    long insert(Message message);

    /**
     * 更新する。
     *
     * @param message 登録済みのメッセージ
     * @return 更新件数
     */
    int update(Message message);

    /**
     * 削除する。
     *
     * @param id メッセージ ID
     * @return 削除件数
     */
    int deleteById(long id);
}
