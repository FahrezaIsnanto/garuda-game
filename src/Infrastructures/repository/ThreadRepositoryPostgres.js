const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }
  async getThread(thread_id) {
    const query = {
      text: 'SELECT aa.title,aa.body,aa.date AS thread_date,bb.username AS thread_username,cc.* FROM threads aa LEFT JOIN users bb ON aa.owner = bb.id LEFT JOIN (SELECT a.id AS comment_id,a.thread_id,b.username AS comment_username,a.date AS comment_date,a.content,a.is_delete FROM thread_comments a LEFT JOIN users b on a.owner = b.id WHERE a.thread_id = $1) cc ON aa.id = cc.thread_id WHERE aa.id = $1',
      values: [thread_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows;
  }

}

module.exports = ThreadRepositoryPostgres;
