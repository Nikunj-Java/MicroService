CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL
);