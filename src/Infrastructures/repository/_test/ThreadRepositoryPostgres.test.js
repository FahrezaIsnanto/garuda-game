const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
// const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'test-title',
        body: 'test-body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'test-title',
        body: 'test-body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'test-title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThread function',()=>{
    it('should not throw NotFoundError when thread founded',async()=>{
       // Arrange
       const threadId = await ThreadsTableTestHelper.addThread({owner:"user-123"});

       const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadRepositoryPostgres.getThread(threadId)).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw NotFoundError when thread not found',async()=>{
      // Arrange
      const threadId = 'fail-123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread(threadId)).rejects.toThrowError(NotFoundError);
   });
    it('should return thread with comment correctly',async()=>{
      // Arrange
      const date = new Date().toISOString();
      const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
      const userId2 =  await UsersTableTestHelper.addUser({id:"user-2",username:"username-2",fullname:"fullname-2"});
      const threadId = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1,date});
      const commentId1 = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", threadId,content:'content-1',owner:userId1,date});
      const commentId2 = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-2", threadId,content:'content-2',owner:userId2,date});
      await ThreadCommentsTableTestHelper.deleteThreadCommentsByCommentAndThreadId(commentId2,threadId);
      
      const expectedThread={
        id:threadId,
        title:"title-thread",
        body:"body-thread",
        date,
        username:"username-1",
        comments: [{
          id: commentId1,
          username: "username-1",
          date,
          content: "content-1",
        },
        {
          id: commentId2,
          username: "username-2",
          date,
          content: "**komentar telah dihapus**",
        },
      ]
      }

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await expect(threadRepositoryPostgres.getThread(threadId)).resolves.toEqual(expectedThread);

    });
  });

});
