const NewThreadComment = require('../../../Domains/threadComments/entities/NewThreadComment');
const AddedThreadComment = require('../../../Domains/threadComments/entities/AddedThreadComment');
const ThreadCommentRepository = require('../../../Domains/threadComments/ThreadCommentRepository');
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');

describe('AddThreadCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
      thread_id: 'thread-123',
      owner: 'user-123',
    };
    /** creating dependency of use case */
    const mockThreadCommentRepository = new ThreadCommentRepository();

    /** mocking needed function */
    mockThreadCommentRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadCommentRepository.addThreadComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedThreadComment({
          id: 'comment-123',
          content: useCasePayload.content,
          owner: useCasePayload.owner,
      })));

    /** creating use case instance */
    const getThreadCommentUseCase = new AddThreadCommentUseCase({
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const addedThreadComment = await getThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedThreadComment).toStrictEqual(new AddedThreadComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
  }));
    expect(mockThreadCommentRepository.addThreadComment).toBeCalledWith(new NewThreadComment({
      content: useCasePayload.content,
      thread_id: useCasePayload.thread_id,
      owner: useCasePayload.owner,
    }));
  });
});
