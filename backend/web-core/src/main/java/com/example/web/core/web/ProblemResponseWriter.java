package com.example.web.core.web;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import tools.jackson.databind.json.JsonMapper;

/**
 * {@link ProblemResponse} をサーブレット応答へ直接書き出す部品。
 *
 * <p>用途: Spring MVC の例外ハンドラを通らない Security フィルタ層（認証エラー・認可エラー）で、
 * Controller と同じ形式のエラー応答を返すために使う。</p>
 */
public class ProblemResponseWriter {

    private final JsonMapper jsonMapper;

    /**
     * 部品を生成する。
     *
     * @param jsonMapper JSON 変換に使う Mapper
     */
    public ProblemResponseWriter(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    /**
     * エラー応答を書き出す。
     *
     * @param response 書き出し先
     * @param problem エラー応答
     * @throws IOException 書き出しに失敗した場合
     */
    public void write(HttpServletResponse response, ProblemResponse problem) throws IOException {
        response.setStatus(problem.status());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        jsonMapper.writeValue(response.getOutputStream(), problem);
    }
}
