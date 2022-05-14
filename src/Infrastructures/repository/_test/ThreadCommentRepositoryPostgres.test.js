const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewThreadComment = require('../../../Domains/threadComments/entities/NewThreadComment');
const AddedThreadComment = require('../../../Domains/threadComments/entities/AddedThreadComment');
const pool = require('../../database/postgres/pool');
const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres');

describe('ThreadCommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreadComment function', () => {
    it('should persist new threadcomment and return added threadcomment correctly', async () => {
      // Arrange
      const newThreadComment = new NewThreadComment({
        content: 'test-content',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadCommentRepositoryPostgres.addThreadComment(newThreadComment);

      // Assert
      const threadComments = await ThreadCommentsTableTestHelper.findThreadCommentsById('comment-123');
      expect(threadComments).toHaveLength(1);
    });

    it('should return added threadcomment correctly', async () => {
      // Arrange
      const newThreadComment = new NewThreadComment({
        content: 'test-content',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThreadComment = await threadCommentRepositoryPostgres.addThreadComment(newThreadComment);

      // Assert
      expect(addedThreadComment).toStrictEqual(new AddedThreadComment({
        id: 'comment-123',
        content: 'test-content',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExist function',()=>{
    it('should throw NotFoundError when thread not exist',async()=>{
       // Arrange
       await ThreadsTableTestHelper.addThread({}); // memasukan thread dengan mengembalikan threadId baru
       const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadCommentRepositoryPostgres.verifyThreadExist({threadId:'thread-fail'})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when thread exist',async()=>{
      // Arrange
      const threadId = await ThreadsTableTestHelper.addThread({}); // memasukan thread dengan mengembalikan threadId baru
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadExist({threadId})).resolves.not.toThrowError(NotFoundError);
   });
  });

  describe('verifyThreadCommentOwner function',()=>{
    it('should not throw AuthorizationError when owner authorized',async()=>{
       // Arrange
       const threadId = await ThreadsTableTestHelper.addThread({});
       const commentId = await ThreadCommentsTableTestHelper.addThreadComment({});
       const owner = "user-123";

       const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({commentId,threadId,owner})).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when comment not found',async()=>{
      // Arrange
      const threadId = await ThreadsTableTestHelper.addThread({});
      const commentId = "not-found-comment";
      const owner = "user-123";

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({commentId,threadId,owner})).rejects.toThrowError(NotFoundError);
   });

   it('should throw AuthorizationError when comment not own by owner',async()=>{
    // Arrange
    const threadId = await ThreadsTableTestHelper.addThread({});
    const commentId = await ThreadCommentsTableTestHelper.addThreadComment({});
    const owner = "user-another-123";

    const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

    // Action & Assert
    await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({commentId,threadId,owner})).rejects.toThrowError(AuthorizationError);
  });

  });

  describe('deleteThreadCommentByCommentAndThreadId function',()=>{
    it('should throw NotFoundError when comment not found',async ()=>{
      // Arrange
      const threadId = "thread-fail-123"
      const commentId = "comment-fail-123"

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({commentId,threadId})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when comment success delete',async ()=>{
      // Arrange
      const threadId = await ThreadsTableTestHelper.addThread({});
      const commentId = await ThreadCommentsTableTestHelper.addThreadComment({});

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({threadId,commentId})).resolves.not.toThrowError(NotFoundError);
    });
    it('is_delete column must 1 after delete',async ()=>{
      // Arrange
      const threadId = await ThreadsTableTestHelper.addThread({});
      const commentId = await ThreadCommentsTableTestHelper.addThreadComment({});

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({threadId,commentId})).resolves.not.toThrowError(NotFoundError);
      
      const deletedComment = await ThreadCommentsTableTestHelper.findThreadCommentsByCommentAndThreadId(commentId,threadId);
      await expect(deletedComment[0].is_delete).toEqual("1");
    });
  }); 

});
