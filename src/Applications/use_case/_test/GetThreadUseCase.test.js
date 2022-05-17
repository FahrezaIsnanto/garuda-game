const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const pool = require('../../../Infrastructures/database/postgres/pool');


describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dan mengembalikan thread dengan benar
   */
  it('should orchestrating the get threads action and return thread correctly', async () => {
    // Arrange

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        thread_id: 'thread-123',
        title: 'title-thread',
        body: 'body-thread',
        thread_date: '2022-01-01',
        thread_username: 'username-1',
        comment_id: 'comment-123',
        comment_username: 'username-1',
        comment_date: '2022-01-01',
        content: 'content-1',
        is_delete: '0',
      },
      {
        thread_id: 'thread-123',
        title: 'title-thread',
        body: 'body-thread',
        thread_date: '2022-01-01',
        thread_username: 'username-1',
        comment_id: 'comment-124',
        comment_username: 'username-2',
        comment_date: '2022-01-02',
        is_delete: '1',
      }]));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute();

    // Assert
    expect(thread).toStrictEqual({
      id: 'thread-123',
      title: 'title-thread',
      body: 'body-thread',
      date: new Date('2022-01-01').toISOString(),
      username: 'username-1',
      comments: [{
          id: 'comment-123',
          username: 'username-1',
          date: new Date('2022-01-01').toISOString(),
          content: 'content-1',
      },
      {
          id: 'comment-124',
          username: 'username-2',
          date: new Date('2022-01-02').toISOString(),
          content: '**komentar telah dihapus**',
      }],
  });
  });
});
