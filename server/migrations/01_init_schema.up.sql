CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash CHAR(60) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);