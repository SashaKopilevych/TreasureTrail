CREATE TABLE category(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE treasure (
    id  SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    image_name TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hint TEXT,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id)
    is_found BOOLEAN DEFAULT false
);
