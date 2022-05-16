class DeleteThreadCommentUseCase {
    constructor({
      threadCommentRepository,
    }) {
      this._threadCommentRepository = threadCommentRepository;
    }
  
    async execute(useCasePayload) {
      this._validatePayload(useCasePayload);
      const { comment_id,thread_id } = useCasePayload;
      await this._threadCommentRepository.verifyThreadCommentOwner(useCasePayload);
      await this._threadCommentRepository.deleteThreadCommentByCommentAndThreadId({comment_id,thread_id});
    }
  
    _validatePayload(payload) {
      const { comment_id,thread_id,owner } = payload;
      if (!comment_id || !thread_id || !owner) {
        throw new Error('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
      }
    }
  }
  
  module.exports = DeleteThreadCommentUseCase;
  