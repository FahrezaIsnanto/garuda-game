/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentsTableTestHelper = {
  async addThreadComment({
    id = 'comment-123', content = 'content-test', threadId = 'thread-123',is_delete="0", date = new Date().toISOString(),owner='user-123'
  }) {
    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, content, threadId, is_delete ,date, owner],
    };

    const result = await pool.query(query);
    return result.rows[0].id;
  },

  async findThreadCommentsById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findThreadCommentsByCommentAndThreadId(commentId,threadId) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE "id" = $1 AND "threadId" = $2',
      values: [commentId,threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteThreadCommentsByCommentAndThreadId(commentId,threadId){
    const is_delete = "1";
    const query = {
      text: 'UPDATE thread_comments set "is_delete" = $1 WHERE "id" = $2 AND "threadId" = $3 RETURNING id,is_delete',
      values: [is_delete,commentId,threadId]
    }

    const result = await pool.query(query);
    return result.rows[0];
  },


  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = ThreadCommentsTableTestHelper;
