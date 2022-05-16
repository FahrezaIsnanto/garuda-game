const NewThreadComment = require('../../Domains/threadComments/entities/NewThreadComment');

class AddThreadCommentUseCase {
  constructor({ threadCommentRepository }) {
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload);
    const {thread_id} = useCasePayload;
    await this._threadCommentRepository.verifyThreadExist({thread_id});
    return await this._threadCommentRepository.addThreadComment(newThreadComment);
  }
}

module.exports = AddThreadCommentUseCase;
