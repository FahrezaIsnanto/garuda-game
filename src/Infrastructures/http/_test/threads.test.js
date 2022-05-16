const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'test-title',
        body: 'test-body',
      };

      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      // add threads with access token
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when request header not contain token', async()=>{
      // Arrange
      const requestPayload = {
        title: 'test-title',
        body: 'test-body',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'test-title'
      };

      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: [],
        body: true,
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

  });

  describe('when POST /threads/{thread_id}/comments',()=>{
    it('should response 201 and persisted thread comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'test-content',
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title: 'title-test',
        body: 'body-test',
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const thread_id = JSON.parse(responseThread.payload).data.addedThread.id;

      // add threads with access token
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when request header not contain token', async()=>{
      // Arrange
      const requestPayload = {
        content: 'test-content',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        
      };

      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: "test-content",
      };
      const threadPayload = {
        title:'title-test',
        body:'body-test'
      };
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-fail-123/comments',
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

  });

  describe('when DELETE /threads/{thread_id}/comments/{comment_id}',()=>{

    it('should response 200 when success delete comment', async()=>{
      // Arrange
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const threadPayload = {
        title:'title-test',
        body:'body-test'
      };
      const requestPayload = {
        content: "content-test"
      };
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // get access token
      const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });

      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const thread_id = JSON.parse(responseThread.payload).data.addedThread.id;

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const comment_id = JSON.parse(responseComment.payload).data.addedComment.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/${comment_id}`,
        payload: requestPayload,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const responseJson = JSON.parse(response.payload);

      // Assert

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it('should response 401 when request header not contain token', async()=>{
      // Arrange
      const thread_id = "thread-123";
      const comment_id = "comment-123";
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/${comment_id}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 403 when delete comment not by the owner', async()=>{
      
      const userPayloadA = {
        username: 'dicodingA',
        password: 'secret',
      };
      const userPayloadB = {
        username: 'dicodingB',
        password: 'secret',
      };
      const requestPayloadThread = {
        title: 'test-title',
        body: 'test-body',
      };
      const requestPayloadComment = {
        content: 'test-content',
      };
      
      
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingA',
          password: 'secret',
          fullname: 'Dicoding Indonesia A',
        },
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingB',
          password: 'secret',
          fullname: 'Dicoding Indonesia B',
        },
      });

       // get access token
       const responseTokenA = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayloadA,
      });
      const responseTokenB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayloadB,
      });
      const accessTokenA = JSON.parse(responseTokenA.payload).data.accessToken;
      const accessTokenB = JSON.parse(responseTokenB.payload).data.accessToken;

      // add thread with user A
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          'Authorization': `Bearer ${accessTokenA}`,
        }
      });
      const thread_id = JSON.parse(responseThread.payload).data.addedThread.id;
      
      // add thread comment with user A
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: requestPayloadComment,
        headers: {
          'Authorization': `Bearer ${accessTokenA}`,
        }
      });
      const comment_id = JSON.parse(responseComment.payload).data.addedComment.id;


      // delete comment with access token B
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/${comment_id}`,
        headers: {
          'Authorization': `Bearer ${accessTokenB}`,
        }
      });

      const responseJson = JSON.parse(response.payload);

      // Assert
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
    });

    it('should response 404 when delete comment not found', async()=>{
      
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const requestPayloadThread = {
        title: 'test-title',
        body: 'test-body',
      };
      const requestPayloadComment = {
        content: 'test-content',
      };
      
      
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

       // get access token
       const responseToken = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload,
      });
      const accessToken = JSON.parse(responseToken.payload).data.accessToken;

      // add thread with user 
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayloadThread,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      const thread_id = JSON.parse(responseThread.payload).data.addedThread.id;
      
      // add thread comment with user A
      await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: requestPayloadComment,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      // delete comment with access token B
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/comment-failed-id`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const responseJson = JSON.parse(response.payload);

      // Assert
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
    });

  });

  describe('when GET /threads/{thread_id}',()=>{
    it('should response 404 when thread not found',async ()=>{
      // Arrange
      const thread_id = 'fail-thread-id';
      const server = await createServer(container);

      // Action
       const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread_id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
   
    it('should return 200 with payload thread and comment correctly',async()=>{
      // Arrange
      const userId1 = await UsersTableTestHelper.addUser({id:"user-1",username:"username-1",fullname:"fullname-1"});
      const userId2 =  await UsersTableTestHelper.addUser({id:"user-2",username:"username-2",fullname:"fullname-2"});
      const {id:thread_id} = await ThreadsTableTestHelper.addThread({id:'thread-1' ,body:"body-thread",title:"title-thread", owner:userId1});
      const {id:comment_id1} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-1", thread_id,content:'content-1',owner:userId1});
      const {id:comment_id2} = await ThreadCommentsTableTestHelper.addThreadComment({id:"comment-2", thread_id,content:'content-2',owner:userId2});
      await ThreadCommentsTableTestHelper.deleteThreadCommentsByCommentAndThreadId(comment_id2,thread_id);
      const server = await createServer(container);

      const result = await ThreadsTableTestHelper.getThreadWithComment(thread_id);

      var comments = [];
      result.rows.map((comment)=>{
        comments.push({
          id:comment.comment_id,
          username: comment.comment_username,
          date: new Date(comment.comment_date).toISOString(),
          content: (comment.is_delete === "0")?comment.content:"**komentar telah dihapus**"
        });
      });
      const thread = {
        id: result.rows[0].thread_id,
        title:result.rows[0].title,
        body:result.rows[0].body,
        date: new Date(result.rows[0].thread_date).toISOString(),
        username: result.rows[0].thread_username,
        comments
      }
      
      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread_id}`,
      });

      const responseJson = JSON.parse(response.payload);

      // Assert
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toEqual(
        thread
      );
    });
  });
});
