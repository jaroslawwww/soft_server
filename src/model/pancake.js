if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}

function create(name, email, phone, time, products, total_price){
    const sql = `
        INSERT INTO pancake_data ($<this:name>)
        VALUES ($<name>, $<email>, $<phone>, $<time>, $<products>, $<total_price>)
        RETURNING *
    `;
    return db.one(sql, {name, email, phone, time, products, total_price});
}

function createUser(userid, name, email){
    const sql = `
        INSERT INTO pancake_user ($<this:name>)
        VALUES ($<userid>, $<name>, $<email>)
        RETURNING *
    `;
    return db.one(sql, {userid, name, email});
}

function listOrder(userid, name, email){
    const where = [];
    where.push(`name = '$1:value'`);
    where.push(`email = '$2:value'`);
    const sql = `
        SELECT *
        FROM pancake_data
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    `;
    return db.any(sql, [name, email]);
}

module.exports = {
    create,
    listOrder,
    createUser,
};
