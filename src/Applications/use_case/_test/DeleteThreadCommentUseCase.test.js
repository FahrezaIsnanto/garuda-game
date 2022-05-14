const ThreadCommentRepository = require('../../../Domains/threadComments/ThreadCommentRepository');
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');

describe('DeleteThreadCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({});

    // Action & Assert
    await expect(deleteThreadCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_THREAD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should orchestrating the delete thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
        commentId : 'comment-123',
        threadId: 'thread-123',
        owner:  'user-123'
    };
    const mockThreadCommentRepository = new ThreadCommentRepository();
    mockThreadCommentRepository.verifyThreadCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.deleteThreadCommentByCommentAndThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Act
    await deleteThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadCommentRepository.verifyThreadCommentOwner)
      .toHaveBeenCalledWith(useCasePayload);
    expect(mockThreadCommentRepository.deleteThreadCommentByCommentAndThreadId)
      .toHaveBeenCalledWith({commentId:useCasePayload.commentId,threadId:useCasePayload.threadId});
  });
});
