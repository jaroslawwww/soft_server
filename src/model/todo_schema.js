require('../../config.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Drop (droppable only when no dependency)
    DROP INDEX IF EXISTS todo_posts_idx_text;
    DROP INDEX IF EXISTS todo_posts_idx_ts;
    DROP TABLE IF EXISTS todo_posts;

    -- Create
    CREATE TABLE todo_posts (
        id              serial PRIMARY KEY NOT NULL,
        mood            mood NOT NULL,
        text            text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
        "doneTs"        bigint DEFAULT NULL
    );
    CREATE INDEX todo_posts_idx_ts ON todo_posts USING btree(ts);
    CREATE INDEX todo_posts_idx_text ON todo_posts USING gin(text gin_trgm_ops);
`;

const dataSql = `
  -- Populate dummy posts
  INSERT INTO posts (mood, text, ts)
  SELECT
    'Clear',
      'word' || i || ' word' || (i+1) || ' word' || (i+2),
      round(extract(epoch from now()) + (i - 10) * 3600.0)
  FROM generate_series(1, 10) AS s(i);
`;

db.none(schemaSql).then(() => {
    console.log('Todo Schema created');
    db.none(dataSql).then(() => {
        console.log('Todo Data populated');
        pgp.end();
    });
}).catch(err => {
    console.log('Error creating schema', err);
});
