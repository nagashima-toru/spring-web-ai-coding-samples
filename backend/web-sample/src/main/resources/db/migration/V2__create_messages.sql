-- メッセージ
CREATE TABLE app.messages (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code       VARCHAR(50)  NOT NULL UNIQUE,
    content    VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_messages_created_at ON app.messages (created_at DESC, id DESC);

COMMENT ON TABLE app.messages IS 'メッセージ';
