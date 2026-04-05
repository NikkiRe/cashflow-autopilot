-- Companies
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cash Accounts
CREATE TABLE cash_accounts (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50),
    currency VARCHAR(3) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cash_account_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Counterparties
CREATE TABLE counterparties (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id BIGINT,
    type VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_counterparty_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Invoices (Accounts Receivable)
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    cash_account_id BIGINT NOT NULL,
    counterparty_id BIGINT,
    invoice_number VARCHAR(100),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_cash_account FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id),
    CONSTRAINT fk_invoice_counterparty FOREIGN KEY (counterparty_id) REFERENCES counterparties(id)
);

CREATE INDEX idx_invoice_due_date ON invoices(due_date);
CREATE INDEX idx_invoice_status ON invoices(status);

-- Obligations (Planned Expenses)
CREATE TABLE obligations (
    id BIGSERIAL PRIMARY KEY,
    cash_account_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    next_due_date DATE NOT NULL,
    recurrence VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_obligation_cash_account FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id)
);

CREATE INDEX idx_obligation_next_due_date ON obligations(next_due_date);

-- Bank Transactions (Historical)
CREATE TABLE bank_transactions (
    id BIGSERIAL PRIMARY KEY,
    cash_account_id BIGINT NOT NULL,
    booked_at DATE NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_cash_account FOREIGN KEY (cash_account_id) REFERENCES cash_accounts(id)
);

CREATE INDEX idx_transaction_booked_at ON bank_transactions(booked_at);
CREATE INDEX idx_transaction_direction ON bank_transactions(direction);
