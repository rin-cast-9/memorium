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