require('../../config.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Drop (droppable only when no dependency)
    DROP INDEX IF EXISTS posts_idx_text;
    DROP INDEX IF EXISTS posts_idx_ts;
    DROP TABLE IF EXISTS posts;
    DROP TYPE IF EXISTS mood CASCADE;
    DROP INDEX IF EXISTS todo_posts_idx_text;
    DROP INDEX IF EXISTS todo_posts_idx_ts;
    DROP TABLE IF EXISTS todo_posts;
    DROP TABLE IF EXISTS pancake_data;
    DROP TABLE IF EXISTS pancake_user;

    -- Create
    CREATE TYPE mood AS ENUM (
        'Clear',
        'Clouds',
        'Drizzle',
        'Rain',
        'Thunder',
        'Snow',
        'Windy'
    );
    CREATE TABLE posts (
        id              serial PRIMARY KEY NOT NULL,
        mood            mood NOT NULL,
        text            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        "clearVotes"    integer NOT NULL DEFAULT 0,
        "cloudsVotes"   integer NOT NULL DEFAULT 0,
        "drizzleVotes"  integer NOT NULL DEFAULT 0,
        "rainVotes"     integer NOT NULL DEFAULT 0,
        "thunderVotes"  integer NOT NULL DEFAULT 0,
        "snowVotes"     integer NOT NULL DEFAULT 0,
        "windyVotes"    integer NOT NULL DEFAULT 0
    );
    CREATE TABLE todo_posts (
        id              serial PRIMARY KEY NOT NULL,
        mood            mood NOT NULL,
        text            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        "doneTs"        bigint DEFAULT NULL
    );
    CREATE TABLE pancake_data (
        id              serial PRIMARY KEY NOT NULL,
        name            text NOT NULL,
        email           text NOT NULL,
        phone           text NOT NULL,
        time            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        products        text[][],
        total_price     integer NOT NULL DEFAULT 0
    );
    CREATE TABLE pancake_user (
        userid          text NOT NULL,
        name            text NOT NULL,
        email           text NOT NULL
    );

    CREATE INDEX posts_idx_ts ON posts USING btree(ts);
    CREATE INDEX posts_idx_text ON posts USING gin(text gin_trgm_ops);
    CREATE INDEX todo_posts_idx_ts ON todo_posts USING btree(ts);
    CREATE INDEX todo_posts_idx_text ON todo_posts USING gin(text gin_trgm_ops);
`;

const dataSql = `
    -- Populate dummy posts
    INSERT INTO posts (mood, text, ts)
    SELECT
        'Clear',
        'word' || i || ' word' || (i+1) || ' word' || (i+2),
        round(extract(epoch from now()) + (i - 20) * 3600.0)
    FROM generate_series(1, 20) AS s(i);

    INSERT INTO todo_posts (mood, text, ts)
    SELECT
      'Clear',
        'word' || i || ' word' || (i+1) || ' word' || (i+2),
        round(extract(epoch from now()) + (i - 5) * 3600.0)
    FROM generate_series(1, 5) AS s(i);

    INSERT INTO pancake_data (name, email, phone, time, ts, products, total_price)
    VALUES ('Dick', 'smalldick@gmail.com', '0918456123',
    '1449', round(extract(epoch from now())), '{{"morning", "play"}}', 123);
`;

db.none(schemaSql).then(() => {
    console.log('Schema created');
    db.none(dataSql).then(() => {
        console.log('Data populated');
        pgp.end();
    });
}).catch(err => {
    console.log('Error creating schema', err);
});
