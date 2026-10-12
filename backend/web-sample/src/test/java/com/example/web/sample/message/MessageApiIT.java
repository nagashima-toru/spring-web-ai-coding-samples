package com.example.web.sample.message;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.web.sample.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** メッセージ API の結合テスト。 */
class MessageApiIT extends AbstractIntegrationTest {

    @Test
    void 一覧_作成日時の新しい順にページ単位で返す() throws Exception {
        insert("old", "2026-01-01T00:00:00Z");
        insert("mid", "2026-01-02T00:00:00Z");
        insert("new", "2026-01-03T00:00:00Z");

        mockMvc.perform(asViewer(get("/api/messages").param("page", "0").param("size", "2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].code").value("new"))
                .andExpect(jsonPath("$.content[1].code").value("mid"))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(2))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.size").value(2));
    }

    @Test
    void 一覧_件数が上限超過_400() throws Exception {
        mockMvc.perform(asViewer(get("/api/messages").param("size", "101")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("size"));
    }

    @Test
    void 一覧_トークンなし_401() throws Exception {
        mockMvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
    }

    @Test
    void 取得_存在するID_メッセージを返す() throws Exception {
        long id = insert("hello", "2026-01-01T00:00:00Z");

        mockMvc.perform(asViewer(get("/api/messages/{id}", id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("hello"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void 取得_存在しないID_404() throws Exception {
        mockMvc.perform(asViewer(get("/api/messages/{id}", 999)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://api.example.com/errors/not-found"));
    }

    @Test
    void 登録_管理者_201とLocationを返す() throws Exception {
        create("MSG_001", "本文")
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.matchesPattern("/api/messages/\\d+")))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.code").value("MSG_001"));
    }

    @Test
    void 登録_コードが重複_409() throws Exception {
        insert("dup", "2026-01-01T00:00:00Z");

        create("dup", "本文").andExpect(status().isConflict());
    }

    @Test
    void 登録_コードが形式違反_400() throws Exception {
        create("不正なコード", "本文").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("code"));
    }

    @Test
    void 登録_閲覧者_403() throws Exception {
        mockMvc.perform(asViewer(post("/api/messages")).contentType(MediaType.APPLICATION_JSON)
                        .content(body("code", "本文")))
                .andExpect(status().isForbidden());
    }

    @Test
    void 更新_管理者_更新後の内容を返す() throws Exception {
        long id = insert("before", "2026-01-01T00:00:00Z");

        mockMvc.perform(asAdmin(put("/api/messages/{id}", id)).contentType(MediaType.APPLICATION_JSON)
                        .content(body("after", "更新後")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("after"))
                .andExpect(jsonPath("$.content").value("更新後"));
    }

    @Test
    void 更新_他のメッセージのコードに変更_409() throws Exception {
        insert("taken", "2026-01-01T00:00:00Z");
        long id = insert("mine", "2026-01-02T00:00:00Z");

        mockMvc.perform(asAdmin(put("/api/messages/{id}", id)).contentType(MediaType.APPLICATION_JSON)
                        .content(body("taken", "本文")))
                .andExpect(status().isConflict());
    }

    @Test
    void 更新_存在しないID_404() throws Exception {
        mockMvc.perform(asAdmin(put("/api/messages/{id}", 999)).contentType(MediaType.APPLICATION_JSON)
                        .content(body("code", "本文")))
                .andExpect(status().isNotFound());
    }

    @Test
    void 削除_管理者_204で以後は404() throws Exception {
        long id = insert("bye", "2026-01-01T00:00:00Z");

        mockMvc.perform(asAdmin(delete("/api/messages/{id}", id))).andExpect(status().isNoContent());
        mockMvc.perform(asAdmin(delete("/api/messages/{id}", id))).andExpect(status().isNotFound());
    }

    private long insert(String code, String createdAt) {
        return jdbcTemplate.queryForObject("INSERT INTO app.messages (code, content, created_at, updated_at) "
                + "VALUES (?, 'content', ?::timestamptz, ?::timestamptz) RETURNING id", Long.class,
                code, createdAt, createdAt);
    }

    private ResultActions create(String code, String content) throws Exception {
        return mockMvc.perform(asAdmin(post("/api/messages")).contentType(MediaType.APPLICATION_JSON)
                .content(body(code, content)));
    }

    private MockHttpServletRequestBuilder asAdmin(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", bearer("admin", "ADMIN"));
    }

    private MockHttpServletRequestBuilder asViewer(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", bearer("viewer", "VIEWER"));
    }

    private static String body(String code, String content) {
        return "{\"code\":\"%s\",\"content\":\"%s\"}".formatted(code, content);
    }
}
