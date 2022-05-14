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
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }
  async getThread(threadId) {
    const query = {
      text: 'SELECT aa."title",aa."body",aa."date" "threadDate",bb."username" "threadUsername",cc.* FROM threads aa LEFT JOIN users bb ON aa.owner = bb.id LEFT JOIN (SELECT a."id" "commentId",a."threadId",b."username" "commentUsername",a."date" "commentDate",a."content",a."is_delete" FROM thread_comments a LEFT JOIN users b on a."owner" = b."id" WHERE a."threadId" = $1) cc ON aa."id" = cc."threadId" WHERE aa."id" = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    var comments = [];
    result.rows.map((comment)=>{
      comments.push({
        id:comment.commentId,
        username: comment.commentUsername,
        date: comment.commentDate,
        content: (comment.is_delete === "0")?comment.content:"**komentar telah dihapus**"
      });
    });
    const thread = {
      id: result.rows[0].threadId,
      title:result.rows[0].title,
      body:result.rows[0].body,
      date: result.rows[0].threadDate,
      username: result.rows[0].threadUsername,
      comments
    }

    return thread;
  }

}

module.exports = ThreadRepositoryPostgres;
