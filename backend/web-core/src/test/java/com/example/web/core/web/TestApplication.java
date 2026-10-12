package com.example.web.core.web;

import com.example.web.core.config.EnableWebCore;
import com.example.web.core.exception.InvalidInputException;
import com.example.web.core.exception.ResourceConflictException;
import com.example.web.core.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** web-core の部品を組み込んだテスト用アプリケーション。 */
@SpringBootApplication
@EnableWebCore
class TestApplication {

    @Bean
    UserDetailsService userDetailsService() {
        String hash = new BCryptPasswordEncoder().encode("pw");
        return new InMemoryUserDetailsManager(User.withUsername("user").password(hash).roles("VIEWER").build());
    }

    @Bean
    ValidatedService validatedService() {
        return new ValidatedService();
    }

    /** {@code @Validated} によるメソッド検証（AOP）を行うテスト用サービス。 */
    @org.springframework.validation.annotation.Validated
    static class ValidatedService {

        int check(@Max(10) int size) {
            return size;
        }
    }

    /** 各種例外を送出するテスト用 Controller。 */
    @RestController
    static class TestController {

        private final ValidatedService validatedService;

        TestController(ValidatedService validatedService) {
            this.validatedService = validatedService;
        }

        @GetMapping("/api/service")
        Map<String, Integer> service(@RequestParam int size) {
            return Map.of("size", validatedService.check(size));
        }

        record Body(@NotBlank String name) {
        }

        @GetMapping("/public/ping")
        Map<String, String> ping() {
            return Map.of("result", "pong");
        }

        @GetMapping("/api/me")
        Map<String, String> me(java.security.Principal principal) {
            return Map.of("name", principal.getName());
        }

        @GetMapping("/api/admin")
        @PreAuthorize("hasRole('ADMIN')")
        Map<String, String> admin() {
            return Map.of("result", "ok");
        }

        @GetMapping("/api/not-found")
        void notFound() {
            throw new ResourceNotFoundException("対象がありません");
        }

        @GetMapping("/api/conflict")
        void conflict() {
            throw new ResourceConflictException("重複しています");
        }

        @GetMapping("/api/invalid")
        void invalid() {
            throw new InvalidInputException("不正な入力です");
        }

        @GetMapping("/api/bad-credentials")
        void badCredentials() {
            throw new BadCredentialsException("bad");
        }

        @GetMapping("/api/unexpected")
        void unexpected() {
            throw new IllegalStateException("boom");
        }

        @PostMapping("/api/body")
        Body body(@Valid @RequestBody Body body) {
            return body;
        }

        @GetMapping("/api/param")
        Map<String, Integer> param(@RequestParam @Max(10) int size) {
            return Map.of("size", size);
        }
    }
}
