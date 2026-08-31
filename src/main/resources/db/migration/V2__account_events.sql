CREATE TABLE account_revisions (
    account_id BIGINT PRIMARY KEY,
    revision BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE account_outbox (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    revision BIGINT NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    UNIQUE (account_id, revision)
);

CREATE INDEX idx_account_outbox_pending ON account_outbox(id) WHERE published_at IS NULL;
