package com.example.web.sample.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.web.sample.AbstractIntegrationTest;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

/** 認証 API の結合テスト。 */
class AuthApiIT extends AbstractIntegrationTest {

    @Test
    void ログイン_正しい資格情報_トークンを返す() throws Exception {
        login("admin", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void ログイン_誤ったパスワード_401() throws Exception {
        login("admin", "wrong").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type").value("https://api.example.com/errors/unauthorized"));
    }

    @Test
    void ログイン_存在しない利用者_401() throws Exception {
        login("ghost", PASSWORD).andExpect(status().isUnauthorized());
    }

    @Test
    void ログイン_無効化された利用者_401() throws Exception {
        login("disabled", PASSWORD).andExpect(status().isUnauthorized());
    }

    @Test
    void ログイン_ユーザー名が空_400() throws Exception {
        login("", PASSWORD).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("username"));
    }

    @Test
    void 再発行_有効なリフレッシュトークン_新しい組を返し旧トークンは使えなくなる() throws Exception {
        String refresh = refreshTokenOf(login("admin", PASSWORD));

        String newRefresh = refreshTokenOf(refresh(refresh).andExpect(status().isOk()));

        assertThat(newRefresh).isNotEqualTo(refresh);
        refresh(refresh).andExpect(status().isUnauthorized());
        refresh(newRefresh).andExpect(status().isOk());
    }

    @Test
    void 再発行_アクセストークンを渡す_401() throws Exception {
        String access = JsonPath.read(login("admin", PASSWORD).andReturn().getResponse().getContentAsString(),
                "$.accessToken");

        refresh(access).andExpect(status().isUnauthorized());
    }

    @Test
    void ログアウト後_そのリフレッシュトークンで再発行できない() throws Exception {
        String refresh = refreshTokenOf(login("admin", PASSWORD));

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", bearer("admin", "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(refresh)))
                .andExpect(status().isNoContent());

        refresh(refresh).andExpect(status().isUnauthorized());
    }

    @Test
    void ログアウト_トークンなし_401() throws Exception {
        mockMvc.perform(post("/api/auth/logout").contentType(MediaType.APPLICATION_JSON).content(refreshBody("x")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 利用者情報_ログイン中の利用者を返す() throws Exception {
        mockMvc.perform(get("/api/users/me").header("Authorization", bearer("viewer", "VIEWER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("viewer"))
                .andExpect(jsonPath("$.role").value("VIEWER"));
    }

    @Test
    void 利用者情報_トークン発行後に無効化された利用者_401() throws Exception {
        mockMvc.perform(get("/api/users/me").header("Authorization", bearer("disabled", "ADMIN")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 利用者情報_トークンなし_401() throws Exception {
        mockMvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
    }

    private ResultActions login(String username, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"%s\",\"password\":\"%s\"}".formatted(username, password)));
    }

    private ResultActions refresh(String refreshToken) throws Exception {
        return mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(refreshBody(refreshToken)));
    }

    private static String refreshBody(String refreshToken) {
        return "{\"refreshToken\":\"%s\"}".formatted(refreshToken);
    }

    private static String refreshTokenOf(ResultActions actions) throws Exception {
        return JsonPath.read(actions.andReturn().getResponse().getContentAsString(), "$.refreshToken");
    }
}
