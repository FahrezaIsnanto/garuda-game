const AddedThreadComment = require('../../Domains/threadComments/entities/AddedThreadComment');
const ThreadCommentRepository = require('../../Domains/threadComments/ThreadCommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ThreadCommentRepositoryPostgres extends ThreadCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThreadComment(newThreadComment) {
    const { content, threadId, owner } = newThreadComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const is_delete = "0";

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, threadId,is_delete,date, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThreadComment({ ...result.rows[0] });
  }

  async verifyThreadExist({threadId}) {
    const query = {
      text: 'SELECT * FROM threads where "id" = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }

  }

  async verifyThreadCommentOwner({commentId,threadId,owner}) {
    const query = {
      text: 'SELECT * FROM thread_comments where "id" = $1 AND "threadId" = $2',
      values: [commentId,threadId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteThreadCommentByCommentAndThreadId({commentId,threadId}){
    const is_delete = "1";
    const query = {
      text: 'UPDATE thread_comments set "is_delete" = $1 where "id" = $2 AND "threadId" = $3 RETURNING id',
      values: [is_delete,commentId,threadId]
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus comment. Id tidak ditemukan');
    }
  }

}

module.exports = ThreadCommentRepositoryPostgres;
