/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentsTableTestHelper = {
  async addThreadComment({
    id = 'comment-123', content = 'content-test', thread_id = 'thread-123',is_delete="0", owner='user-123'
  }) {
    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5) RETURNING id,date',
      values: [id, content, thread_id, is_delete ,owner],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findThreadCommentsById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findThreadCommentDateById(id) {
    const query = {
      text: 'SELECT date FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0].date;
  },

  async findThreadCommentsByCommentAndThreadId(comment_id,thread_id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1 AND thread_id = $2',
      values: [comment_id,thread_id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteThreadCommentsByCommentAndThreadId(comment_id,thread_id){
    const is_delete = "1";
    const query = {
      text: 'UPDATE thread_comments set is_delete = $1 WHERE id = $2 AND thread_id = $3 RETURNING id,is_delete',
      values: [is_delete,comment_id,thread_id]
    }

    const result = await pool.query(query);
    return result.rows[0];
  },


  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = ThreadCommentsTableTestHelper;
