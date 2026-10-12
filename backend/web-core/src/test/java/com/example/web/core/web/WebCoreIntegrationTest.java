package com.example.web.core.web;

import static org.hamcrest.Matchers.endsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.web.core.security.TokenProvider;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** web-core の Security 設定と共通エラー応答を、テスト用アプリケーションに組み込んで確かめる。 */
@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
class WebCoreIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Test
    void 公開パス_認証なしで200() throws Exception {
        mockMvc.perform(get("/public/ping")).andExpect(status().isOk());
    }

    @Test
    void 保護パスにトークンなし_401の共通エラー応答() throws Exception {
        expectProblem(mockMvc.perform(get("/api/me")), 401, "unauthorized");
    }

    @Test
    void 保護パスにアクセストークン_200() throws Exception {
        mockMvc.perform(get("/api/me").header("Authorization", bearer("VIEWER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("user"));
    }

    @Test
    void 保護パスにリフレッシュトークン_401() throws Exception {
        String refresh = tokenProvider.createRefreshToken("user");

        mockMvc.perform(get("/api/me").header("Authorization", "Bearer " + refresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ロール不足_403の共通エラー応答() throws Exception {
        expectProblem(mockMvc.perform(get("/api/admin").header("Authorization", bearer("VIEWER"))), 403, "forbidden");
    }

    @Test
    void ロール充足_200() throws Exception {
        mockMvc.perform(get("/api/admin").header("Authorization", bearer("ADMIN"))).andExpect(status().isOk());
    }

    @Test
    void ResourceNotFoundException_404() throws Exception {
        expectProblem(authorized(get("/api/not-found")), 404, "not-found")
                .andExpect(jsonPath("$.detail").value("対象がありません"));
    }

    @Test
    void ResourceConflictException_409() throws Exception {
        expectProblem(authorized(get("/api/conflict")), 409, "conflict");
    }

    @Test
    void InvalidInputException_400() throws Exception {
        expectProblem(authorized(get("/api/invalid")), 400, "invalid-input");
    }

    @Test
    void Controller内の認証エラー_401() throws Exception {
        expectProblem(authorized(get("/api/bad-credentials")), 401, "unauthorized");
    }

    @Test
    void 想定外の例外_500で詳細を返さない() throws Exception {
        expectProblem(authorized(get("/api/unexpected")), 500, "internal-error")
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("boom"))));
    }

    @Test
    void ボディの項目チェック違反_400で項目ごとのエラー() throws Exception {
        expectProblem(authorized(post("/api/body").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}")),
                400, "validation-error")
                .andExpect(jsonPath("$.errors[0].field").value("name"));
    }

    @Test
    void パラメータの項目チェック違反_400で項目ごとのエラー() throws Exception {
        expectProblem(authorized(get("/api/param").param("size", "11")), 400, "validation-error")
                .andExpect(jsonPath("$.errors[0].field").value("size"));
    }

    @Test
    void サービスのメソッド検証違反_400で項目ごとのエラー() throws Exception {
        expectProblem(authorized(get("/api/service").param("size", "11")), 400, "validation-error")
                .andExpect(jsonPath("$.errors[0].field").value("size"));
    }

    @Test
    void 解析できないボディ_400() throws Exception {
        expectProblem(authorized(post("/api/body").contentType(MediaType.APPLICATION_JSON).content("{")),
                400, "malformed-request");
    }

    @Test
    void 型の合わないパラメータ_400() throws Exception {
        expectProblem(authorized(get("/api/param").param("size", "abc")), 400, "malformed-request");
    }

    @Test
    void 存在しないパス_404() throws Exception {
        expectProblem(authorized(get("/api/unknown")), 404, "http-404");
    }

    @Test
    void 未対応のメソッド_405() throws Exception {
        expectProblem(authorized(post("/api/me")), 405, "http-405");
    }

    @Test
    void 許可オリジンからのプリフライト_許可ヘッダを返す() throws Exception {
        mockMvc.perform(options("/api/me")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    void 許可していないオリジンからのプリフライト_403() throws Exception {
        mockMvc.perform(options("/api/me")
                        .header("Origin", "http://evil.example.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void 認証マネージャ_UserDetailsServiceのユーザーで認証できる() {
        var result = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated("user", "pw"));

        org.assertj.core.api.Assertions.assertThat(result.isAuthenticated()).isTrue();
    }

    private ResultActions authorized(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request.header("Authorization", bearer("ADMIN")));
    }

    private String bearer(String role) {
        return "Bearer " + tokenProvider.createAccessToken("user", List.of(role));
    }

    private static ResultActions expectProblem(ResultActions actions, int status, String errorType) throws Exception {
        return actions
                .andExpect(status().is(status))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(status))
                .andExpect(jsonPath("$.type").value(endsWith("/" + errorType)))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
