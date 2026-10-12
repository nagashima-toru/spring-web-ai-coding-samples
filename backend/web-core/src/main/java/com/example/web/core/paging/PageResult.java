package com.example.web.core.paging;

import java.util.List;
import java.util.function.Function;

/**
 * ページング結果。
 *
 * <p>使い方: リポジトリが {@link PageQuery} に対する結果と総件数から生成し、Controller が API の
 * レスポンス形式に変換する。</p>
 *
 * @param <T> 要素の型
 * @param content 当該ページの要素
 * @param page ページ番号（0 始まり）
 * @param size 1ページあたりの件数
 * @param totalElements 全体の件数
 */
public record PageResult<T>(List<T> content, int page, int size, long totalElements) {

    /** 要素リストを不変コピーとして保持する。 */
    public PageResult {
        content = List.copyOf(content);
    }

    /**
     * 条件と取得結果からページング結果を生成する。
     *
     * @param <T> 要素の型
     * @param query ページング条件
     * @param content 当該ページの要素
     * @param totalElements 全体の件数
     * @return ページング結果
     */
    public static <T> PageResult<T> of(PageQuery query, List<T> content, long totalElements) {
        return new PageResult<>(content, query.page(), query.size(), totalElements);
    }

    /**
     * 全ページ数を返す。
     *
     * @return 全ページ数（0 件の場合は 0）
     */
    public int totalPages() {
        return (int) ((totalElements + size - 1) / size);
    }

    /**
     * 要素を変換したページング結果を返す。
     *
     * @param <R> 変換後の型
     * @param mapper 変換関数
     * @return 変換後のページング結果
     */
    public <R> PageResult<R> map(Function<? super T, ? extends R> mapper) {
        return new PageResult<>(content.stream().<R>map(mapper).toList(), page, size, totalElements);
    }
}
