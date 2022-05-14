class DeleteThreadCommentUseCase {
    constructor({
      threadCommentRepository,
    }) {
      this._threadCommentRepository = threadCommentRepository;
    }
  
    async execute(useCasePayload) {
      this._validatePayload(useCasePayload);
      const { commentId,threadId } = useCasePayload;
      await this._threadCommentRepository.verifyThreadCommentOwner(useCasePayload);
      await this._threadCommentRepository.deleteThreadCommentByCommentAndThreadId({commentId,threadId});
    }
  
    _validatePayload(payload) {
      const { commentId,threadId,owner } = payload;
      if (!commentId || !threadId || !owner) {
        throw new Error('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
      }
    }
  }
  
  module.exports = DeleteThreadCommentUseCase;
  