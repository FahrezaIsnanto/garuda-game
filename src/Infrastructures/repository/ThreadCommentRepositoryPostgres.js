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
    const { content, thread_id, owner } = newThreadComment;
    const id = `comment-${this._idGenerator()}`;
    const is_delete = "0";

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, thread_id,is_delete,owner],
    };

    const result = await this._pool.query(query);

    return new AddedThreadComment({ ...result.rows[0] });
  }

  async verifyThreadExist({thread_id}) {
    const query = {
      text: 'SELECT * FROM threads where id = $1',
      values: [thread_id],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }

  }

  async verifyThreadCommentOwner({comment_id,thread_id,owner}) {
    const query = {
      text: 'SELECT * FROM thread_comments where id = $1 AND thread_id = $2',
      values: [comment_id,thread_id],
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

  async deleteThreadCommentByCommentAndThreadId({comment_id,thread_id}){
    const is_delete = "1";
    const query = {
      text: 'UPDATE thread_comments set is_delete = $1 where id = $2 AND thread_id = $3 RETURNING id',
      values: [is_delete,comment_id,thread_id]
    }
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus comment. Id tidak ditemukan');
    }
  }

}

module.exports = ThreadCommentRepositoryPostgres;
