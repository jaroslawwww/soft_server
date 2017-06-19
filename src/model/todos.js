// const fs = require('fs');
// const uuid = require('uuid/v4');
const moment = require('moment');

if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}

function list(searchText = '', unaccomplishedOnly = 'false', start) {
    const where = [];
    if(searchText) where.push(`text ILIKE '%$1:value%'`);
    if(unaccomplishedOnly === 'true') where.push(`$2:name IS NULL`);
    if(start) where.push('id < $3');
    console.log(where);
    const sql = `
        SELECT *
        FROM todo_posts
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY id DESC
        LIMIT 10
    `;
    return db.any(sql, [searchText, 'doneTs', start]);
}

function create(mood, text) {
    const sql = `
        INSERT INTO todo_posts ($<this:name>)
        VALUES ($<mood>, $<text>)
        RETURNING *
    `;
    return db.one(sql, {mood, text});
}

function accomplished(postId) {
    const sql = `
        UPDATE todo_posts
        SET $3:name = $2:value
        WHERE id = $1
        RETURNING *
    `;
    return db.one(sql, [postId, moment().unix(), 'doneTs']);
}

module.exports = {
    list,
    create,
    accomplished
};
