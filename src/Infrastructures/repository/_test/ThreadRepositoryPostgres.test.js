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
       const {id:thread_id} = await ThreadsTableTestHelper.addThread({owner:"user-123"});

       const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadRepositoryPostgres.getThread(thread_id)).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw NotFoundError when thread not found',async()=>{
      // Arrange
      const thread_id = 'fail-123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread(thread_id)).rejects.toThrowError(NotFoundError);
   });
    it('should return thread with comment correctly',async()=>{
      // Arrange
      const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
      const userId2 =  await UsersTableTestHelper.addUser({id:"user-2",username:"username-2",fullname:"fullname-2"});
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1});
      const {id:comment_id1} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", thread_id,content:'content-1',owner:userId1});
      const {id:comment_id2} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-2", thread_id,content:'content-2',owner:userId2});
      await ThreadCommentsTableTestHelper.deleteThreadCommentsByCommentAndThreadId(comment_id2,thread_id);
      
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadDate = await ThreadsTableTestHelper.findThreadDateById(thread_id);
      const commentDate1 = await ThreadCommentsTableTestHelper.findThreadCommentDateById(comment_id1);
      const commentDate2 = await ThreadCommentsTableTestHelper.findThreadCommentDateById(comment_id2); 

      // Action 
      const result = await threadRepositoryPostgres.getThread(thread_id);

      expect(result[0].thread_id).toEqual(thread_id);
      expect(result[0].comment_id).toEqual(comment_id1);
      expect(result[1].comment_id).toEqual(comment_id2);

    });
  });

});
