/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'title-test', body = 'body-test',owner='user-123'
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id,date',
      values: [id, title, body, owner],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findThreadDateById(id) {
    const query = {
      text: 'SELECT date FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0].date;
  },

  async getThreadWithComment(id) {
    const query = {
      text: 'SELECT aa.title,aa.body,aa.date AS thread_date,bb.username AS thread_username,cc.* FROM threads aa LEFT JOIN users bb ON aa.owner = bb.id LEFT JOIN (SELECT a.id AS comment_id,a.thread_id,b.username AS comment_username,a.date AS comment_date,a.content,a.is_delete FROM thread_comments a LEFT JOIN users b on a.owner = b.id WHERE a.thread_id = $1) cc ON aa.id = cc.thread_id WHERE aa.id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result
  },
  

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
