package com.example.web.core.paging;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class PageResultTest {

    @Test
    void 総件数が件数で割り切れない_全ページ数は切り上げ() {
        PageResult<String> result = PageResult.of(new PageQuery(0, 20), List.of("a"), 41);

        assertThat(result.totalPages()).isEqualTo(3);
        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(20);
    }

    @Test
    void 総件数が0_全ページ数は0() {
        assertThat(PageResult.of(new PageQuery(0, 20), List.of(), 0).totalPages()).isZero();
    }

    @Test
    void map_要素だけを変換しページ情報は保つ() {
        PageResult<Integer> result = PageResult.of(new PageQuery(1, 2), List.of("a", "bb"), 5).map(String::length);

        assertThat(result.content()).containsExactly(1, 2);
        assertThat(result).extracting(PageResult::page, PageResult::size, PageResult::totalElements)
                .containsExactly(1, 2, 5L);
    }
}
