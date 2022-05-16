const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
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
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreadComment function', () => {
    it('should persist new threadcomment and return added threadcomment correctly', async () => {
      // Arrange
      const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1});
      await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", thread_id,content:'content-1',owner:userId1});

      const newThreadComment = new NewThreadComment({
        content: 'content-1',
        thread_id: thread_id,
        owner: userId1,
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
      const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1});
      await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", thread_id,content:'content-1',owner:userId1});

      const newThreadComment = new NewThreadComment({
        content: 'test-content',
        thread_id: thread_id,
        owner: userId1,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThreadComment = await threadCommentRepositoryPostgres.addThreadComment(newThreadComment);

      // Assert
      expect(addedThreadComment).toStrictEqual(new AddedThreadComment({
        id: 'comment-123',
        content: 'test-content',
        owner: userId1,
      }));
    });
  });

  describe('verifyThreadExist function',()=>{
    it('should throw NotFoundError when thread not exist',async()=>{
       // Arrange
       await ThreadsTableTestHelper.addThread({}); // memasukan thread dengan mengembalikan thread_id baru
       const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadCommentRepositoryPostgres.verifyThreadExist({thread_id:'thread-fail'})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when thread exist',async()=>{
      // Arrange
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({}); // memasukan thread dengan mengembalikan thread_id baru
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadExist({thread_id})).resolves.not.toThrowError(NotFoundError);
   });
  });

  describe('verifyThreadCommentOwner function',()=>{
    it('should not throw AuthorizationError when owner authorized',async()=>{
       // Arrange
       const {id:thread_id} = await ThreadsTableTestHelper.addThread({});
       const {id:comment_id} = await ThreadCommentsTableTestHelper.addThreadComment({});
       const owner = "user-123";

       const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
 
       // Action & Assert
       await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({comment_id,thread_id,owner})).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when comment not found',async()=>{
      // Arrange
      const thread_id = await ThreadsTableTestHelper.addThread({});
      const comment_id = "not-found-comment";
      const owner = "user-123";

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({comment_id,thread_id,owner})).rejects.toThrowError(NotFoundError);
   });

   it('should throw AuthorizationError when comment not own by owner',async()=>{
    // Arrange
    const {id:thread_id} = await ThreadsTableTestHelper.addThread({});
    const {id:comment_id} = await ThreadCommentsTableTestHelper.addThreadComment({});
    const owner = "user-another-123";

    const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

    // Action & Assert
    await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner({comment_id,thread_id,owner})).rejects.toThrowError(AuthorizationError);
  });

  });

  describe('deleteThreadCommentByCommentAndThreadId function',()=>{
    it('should throw NotFoundError when comment not found',async ()=>{
      // Arrange
      const thread_id = "thread-fail-123"
      const comment_id = "comment-fail-123"

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({comment_id,thread_id})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when comment success delete',async ()=>{
      // Arrange
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({});
      const {id:comment_id} = await ThreadCommentsTableTestHelper.addThreadComment({});

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({thread_id,comment_id})).resolves.not.toThrowError(NotFoundError);
    });
    it('is_delete column must 1 after delete',async ()=>{
      // Arrange
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({});
      const {id:comment_id} = await ThreadCommentsTableTestHelper.addThreadComment({});

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadCommentByCommentAndThreadId({thread_id,comment_id})).resolves.not.toThrowError(NotFoundError);
      
      const deletedComment = await ThreadCommentsTableTestHelper.findThreadCommentsByCommentAndThreadId(comment_id,thread_id);
      await expect(deletedComment[0].is_delete).toEqual("1");
    });
  }); 

});
