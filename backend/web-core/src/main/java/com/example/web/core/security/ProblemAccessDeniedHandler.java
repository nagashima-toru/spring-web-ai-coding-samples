package com.example.web.core.security;

import com.example.web.core.web.ProblemResponseFactory;
import com.example.web.core.web.ProblemResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/** フィルタ層で認可されなかったアクセスに共通エラー応答（403）を返す。 */
public class ProblemAccessDeniedHandler implements AccessDeniedHandler {

    private final ProblemResponseFactory factory;
    private final ProblemResponseWriter writer;

    /**
     * 部品を生成する。
     *
     * @param factory エラー応答の組み立て部品
     * @param writer エラー応答の書き出し部品
     */
    public ProblemAccessDeniedHandler(ProblemResponseFactory factory, ProblemResponseWriter writer) {
        this.factory = factory;
        this.writer = writer;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        writer.write(response, factory.create(HttpStatus.FORBIDDEN, "forbidden",
                "この操作を行う権限がありません。", request.getRequestURI()));
    }
}
