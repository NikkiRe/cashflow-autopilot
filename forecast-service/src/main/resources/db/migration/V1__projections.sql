CREATE TABLE processed_events (
    event_id UUID PRIMARY KEY,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_projections (
    account_id BIGINT PRIMARY KEY,
    revision BIGINT NOT NULL,
    deleted BOOLEAN NOT NULL,
    payload TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
