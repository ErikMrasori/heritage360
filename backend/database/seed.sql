INSERT INTO roles (name)
VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name)
VALUES ('Historical'), ('Cultural'), ('Natural')
ON CONFLICT (name) DO NOTHING;
