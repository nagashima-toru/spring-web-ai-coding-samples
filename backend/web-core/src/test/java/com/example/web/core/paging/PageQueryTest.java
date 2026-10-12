package com.example.web.core.paging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class PageQueryTest {

    @Test
    void 正しい条件_オフセットはページ番号と件数の積() {
        assertThat(new PageQuery(2, 20).offset()).isEqualTo(40L);
    }

    @Test
    void ページ番号が負_IllegalArgumentException() {
        assertThatThrownBy(() -> new PageQuery(-1, 20)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 件数が0_IllegalArgumentException() {
        assertThatThrownBy(() -> new PageQuery(0, 0)).isInstanceOf(IllegalArgumentException.class);
    }
}
