package com.example.web.core.security;

/** トークンの種別。アクセストークンとリフレッシュトークンを取り違えて使えないようにする。 */
public enum TokenType {
    /** API 呼び出しに使うトークン。 */
    ACCESS,
    /** アクセストークンの再発行に使うトークン。 */
    REFRESH
}
