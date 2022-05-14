const NewThreadComment = require('../../Domains/threadComments/entities/NewThreadComment');

class AddThreadCommentUseCase {
  constructor({ threadCommentRepository }) {
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(useCasePayload) {
    const newThreadComment = new NewThreadComment(useCasePayload);
    const {threadId} = useCasePayload;
    await this._threadCommentRepository.verifyThreadExist({threadId});
    return await this._threadCommentRepository.addThreadComment(newThreadComment);
  }
}

module.exports = AddThreadCommentUseCase;
