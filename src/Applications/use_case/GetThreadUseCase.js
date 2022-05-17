class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(thread_id) {
    const result = await this._threadRepository.getThread(thread_id);

    var comments = [];
    result.map((comment)=>{
      comments.push({
        id:comment.comment_id,
        username: comment.comment_username,
        date: new Date(comment.comment_date).toISOString(),
        content: (comment.is_delete === "0")?comment.content:"**komentar telah dihapus**"
      });
    });
    const thread = {
      id: result[0].thread_id,
      title:result[0].title,
      body:result[0].body,
      date: new Date(result[0].thread_date).toISOString(),
      username: result[0].thread_username,
      comments
    }
    return thread;
  }
}

module.exports = GetThreadUseCase;
