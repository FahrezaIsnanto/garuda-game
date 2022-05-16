const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../../Infrastructures/database/postgres/pool');

afterEach(async () => {
  await ThreadsTableTestHelper.cleanTable();
  await ThreadCommentsTableTestHelper.cleanTable();
  await UsersTableTestHelper.cleanTable();
});

afterAll(async () => {
  await pool.end();
});

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dan mengembalikan thread dengan benar
   */
  it('should orchestrating the get threads action and return thread correctly', async () => {
    // Arrange
    const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
    const userId2 =  await UsersTableTestHelper.addUser({id:"user-2",username:"username-2",fullname:"fullname-2"});
    const {id:thread_id} = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1});
    const {id:comment_id1} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", thread_id,content:'content-1',owner:userId1});
    const {id:comment_id2} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-2", thread_id,content:'content-2',owner:userId2});
    await ThreadCommentsTableTestHelper.deleteThreadCommentsByCommentAndThreadId(comment_id2,thread_id);
      
    const threadDate = await ThreadsTableTestHelper.findThreadDateById(thread_id);
    const commentDate1 = await ThreadCommentsTableTestHelper.findThreadCommentDateById(comment_id1);
    const commentDate2 = await ThreadCommentsTableTestHelper.findThreadCommentDateById(comment_id2);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve({rows:[{
        thread_id:thread_id,
        title:"title-thread",
        body:"body-thread",
        thread_date:new Date(threadDate).toISOString(),
        thread_username:"username-1",
        comment_id:comment_id1,
        comment_username:"username-1",
        comment_date:commentDate1,
        content: "content-1",
        is_delete:"0"
      },
      {
        thread_id:thread_id,
        title:"title-thread",
        body:"body-thread",
        thread_date:threadDate,
        thread_username:"username-1",
        comment_id:comment_id2,
        comment_username:"username-2",
        comment_date:commentDate2,
        is_delete:"1"
      }
      ]}));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(thread_id);

    // Assert
    expect(thread).toStrictEqual({
      id:thread_id,
      title:"title-thread",
      body:"body-thread",
      date: new Date(threadDate).toISOString(),
      username:"username-1",
      comments: [{
        id: comment_id1,
        username: "username-1",
        date: new Date(commentDate1).toISOString(),
        content: "content-1",
      },
      {
        id: comment_id2,
        username: "username-2",
        date: new Date(commentDate2).toISOString(),
        content: "**komentar telah dihapus**",
      },
    ]
    });
  });
});
