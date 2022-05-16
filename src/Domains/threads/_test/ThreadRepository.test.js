const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();
    const thread_idTest = 'thread-test-123'

    // Action and Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.getThread(thread_idTest)).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
