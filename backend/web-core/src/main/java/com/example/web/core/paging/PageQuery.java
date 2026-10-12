package com.example.web.core.paging;

/**
 * ページング条件。
 *
 * <p>使い方: Controller でリクエストパラメータから生成し、ユースケース・リポジトリへ渡す。
 * SQL では {@link #offset()} と {@link #size()} を {@code OFFSET} / {@code LIMIT} に使う。</p>
 *
 * @param page ページ番号（0 始まり）
 * @param size 1ページあたりの件数（1 以上）
 */
public record PageQuery(int page, int size) {

    /**
     * ページング条件を検証して生成する。
     *
     * @throws IllegalArgumentException page が負、または size が 1 未満の場合
     */
    public PageQuery {
        if (page < 0) {
            throw new IllegalArgumentException("page は 0 以上で指定してください: " + page);
        }
        if (size < 1) {
            throw new IllegalArgumentException("size は 1 以上で指定してください: " + size);
        }
    }

    /**
     * 先頭からの読み飛ばし件数を返す。
     *
     * @return オフセット
     */
    public long offset() {
        return (long) page * size;
    }
}
