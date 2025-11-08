CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash CHAR(60) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE folder_modules (
    folder_id INT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    PRIMARY KEY (folder_id, module_id)
);

CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_card_progresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    correct_count INT NOT NULL DEFAULT 0,
    incorrect_count INT NOT NULL DEFAULT 0,
    last_seen_at TIMESTAMPTZ,
    CONSTRAINT user_card_unique UNIQUE(user_id, card_id)
);

CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    is_review_only BOOLEAN NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    correct_answers INT DEFAULT 0,
    total_questions INT DEFAULT 0
);

CREATE TABLE question_types (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(20) NOT NULL
);

INSERT INTO question_types (display_name) VALUES
('select'),
('spell');

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    test_id INT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    question_type INT NOT NULL REFERENCES question_types(id),
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ
);