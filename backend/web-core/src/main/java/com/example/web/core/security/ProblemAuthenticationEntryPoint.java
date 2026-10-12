package com.example.web.core.security;

import com.example.web.core.web.ProblemResponseFactory;
import com.example.web.core.web.ProblemResponseWriter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/** 未認証のアクセスに共通エラー応答（401）を返す。 */
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ProblemResponseFactory factory;
    private final ProblemResponseWriter writer;

    /**
     * 部品を生成する。
     *
     * @param factory エラー応答の組み立て部品
     * @param writer エラー応答の書き出し部品
     */
    public ProblemAuthenticationEntryPoint(ProblemResponseFactory factory, ProblemResponseWriter writer) {
        this.factory = factory;
        this.writer = writer;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException {
        writer.write(response, factory.create(HttpStatus.UNAUTHORIZED, "unauthorized",
                "認証が必要です。", request.getRequestURI()));
    }
}
