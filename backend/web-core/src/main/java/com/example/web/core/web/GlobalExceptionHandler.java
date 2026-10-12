package com.example.web.core.web;

import com.example.web.core.exception.BusinessException;
import com.example.web.core.exception.InvalidInputException;
import com.example.web.core.exception.ResourceConflictException;
import com.example.web.core.exception.ResourceNotFoundException;
import com.example.web.core.logging.LogSanitizer;
import com.example.web.core.web.ProblemResponse.FieldViolation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * 例外を共通エラー応答（{@link ProblemResponse}）に変換するハンドラ。
 *
 * <p>用途: Controller から送出された例外を、HTTP ステータスと {@code application/problem+json} の応答に
 * 一元的に変換する。業務コードで try-catch してエラー応答を組み立ててはならない。</p>
 *
 * <p>変換規則: 業務例外（{@link BusinessException}）は 4xx、Spring MVC の標準例外は各ステータス、
 * それ以外は 500（詳細はログにだけ出し、利用者には定型文を返す）。</p>
 *
 * <p>拡張ポイント: {@link BusinessException} のサブクラスを追加した場合は、対応するハンドラを本クラスに追加する。</p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String VALIDATION_ERROR = "validation-error";

    private final ProblemResponseFactory factory;

    /**
     * ハンドラを生成する。
     *
     * @param factory エラー応答の組み立て部品
     */
    public GlobalExceptionHandler(ProblemResponseFactory factory) {
        this.factory = factory;
    }

    /**
     * リソース不在を 404 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return business(HttpStatus.NOT_FOUND, ex, request);
    }

    /**
     * 競合を 409 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ProblemResponse> handleConflict(ResourceConflictException ex, HttpServletRequest request) {
        return business(HttpStatus.CONFLICT, ex, request);
    }

    /**
     * 入力不正を 400 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ProblemResponse> handleInvalidInput(InvalidInputException ex, HttpServletRequest request) {
        return business(HttpStatus.BAD_REQUEST, ex, request);
    }

    /**
     * リクエストボディの項目チェック違反を 400 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return 項目ごとのエラーを含むエラー応答
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemResponse> handleBodyValidation(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<FieldViolation> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldViolation(error.getField(), error.getRejectedValue(), error.getDefaultMessage()))
                .toList();
        return validation(errors, request);
    }

    /**
     * パス・クエリパラメータの項目チェック違反を 400 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return 項目ごとのエラーを含むエラー応答
     */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ProblemResponse> handleParameterValidation(HandlerMethodValidationException ex,
            HttpServletRequest request) {
        List<FieldViolation> errors = ex.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream()
                        .map(error -> new FieldViolation(
                                result.getMethodParameter().getParameterName(),
                                result.getArgument(),
                                error.getDefaultMessage())))
                .toList();
        return validation(errors, request);
    }

    /**
     * {@code @Validated} を付けた Bean のメソッド検証違反を 400 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return 項目ごとのエラーを含むエラー応答
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemResponse> handleConstraintViolation(ConstraintViolationException ex,
            HttpServletRequest request) {
        List<FieldViolation> errors = ex.getConstraintViolations().stream()
                .map(violation -> new FieldViolation(lastNode(violation.getPropertyPath()),
                        violation.getInvalidValue(), violation.getMessage()))
                .toList();
        return validation(errors, request);
    }

    /**
     * 解析できないリクエストボディ・型の合わないパラメータを 400 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ProblemResponse> handleMalformedRequest(Exception ex, HttpServletRequest request) {
        LOG.warn("不正な形式のリクエスト: uri={} reason={}", uri(request), LogSanitizer.sanitize(ex.getMessage()));
        return respond(HttpStatus.BAD_REQUEST, "malformed-request", "リクエストの形式が正しくありません。", request);
    }

    /**
     * Controller 内で発生した認証エラーを 401 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemResponse> handleAuthentication(AuthenticationException ex,
            HttpServletRequest request) {
        LOG.warn("認証エラー: uri={} reason={}", uri(request), LogSanitizer.sanitize(ex.getMessage()));
        return respond(HttpStatus.UNAUTHORIZED, "unauthorized", "認証に失敗しました。", request);
    }

    /**
     * メソッドセキュリティ（{@code @PreAuthorize}）の認可エラーを 403 に変換する。
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        LOG.warn("認可エラー: uri={}", uri(request));
        return respond(HttpStatus.FORBIDDEN, "forbidden", "この操作を行う権限がありません。", request);
    }

    /**
     * 想定外の例外を 500 に変換する。詳細はログにだけ出す。
     *
     * <p>Spring MVC の標準例外（存在しないパスの 404・未対応メソッドの 405 など。{@link ErrorResponse} を実装する）は、
     * 例外が持つステータスで返す。</p>
     *
     * @param ex 例外
     * @param request リクエスト
     * @return エラー応答
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        if (ex instanceof ErrorResponse springMvc) {
            HttpStatusCode status = springMvc.getStatusCode();
            LOG.warn("リクエストエラー: uri={} status={}", uri(request), status.value());
            return respond(status, "http-" + status.value(), springMvc.getBody().getDetail(), request);
        }
        LOG.error("想定外のエラー: uri={}", uri(request), ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "internal-error",
                "予期しないエラーが発生しました。時間をおいて再度お試しください。", request);
    }

    private ResponseEntity<ProblemResponse> business(HttpStatus status, BusinessException ex,
            HttpServletRequest request) {
        LOG.info("業務エラー: uri={} type={} detail={}", uri(request), ex.getErrorType(),
                LogSanitizer.sanitize(ex.getMessage()));
        return respond(status, ex.getErrorType(), ex.getMessage(), request);
    }

    private ResponseEntity<ProblemResponse> validation(List<FieldViolation> errors, HttpServletRequest request) {
        LOG.info("入力エラー: uri={} count={}", uri(request), errors.size());
        ProblemResponse body = factory.create(HttpStatus.BAD_REQUEST, VALIDATION_ERROR,
                "入力内容に誤りがあります。", request.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    private ResponseEntity<ProblemResponse> respond(HttpStatusCode status, String errorType, String detail,
            HttpServletRequest request) {
        ProblemResponse body = factory.create(status, errorType, detail, request.getRequestURI());
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    private static String lastNode(Path path) {
        String name = null;
        for (Path.Node node : path) {
            name = node.getName();
        }
        return name;
    }

    private static String uri(HttpServletRequest request) {
        return LogSanitizer.sanitize(request.getRequestURI());
    }
}
