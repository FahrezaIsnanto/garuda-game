class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    return await this._threadRepository.getThread(threadId);
  }
}

module.exports = GetThreadUseCase;
