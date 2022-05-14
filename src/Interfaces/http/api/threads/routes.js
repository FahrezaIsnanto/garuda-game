const routes = (handler) => ([
    {
      method: 'POST',
      path: '/threads',
      handler: handler.postThreadHandler,
      options: {
        auth: 'notesapp_jwt',
      },
    },
    {
      method: 'POST',
      path: '/threads/{threadId}/comments',
      handler: handler.postThreadCommentByIdHandler,
      options: {
        auth: 'notesapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/threads/{threadId}/comments/{commentId}',
      handler: handler.deleteThreadCommentByThreadAndCommentIdHandler,
      options: {
        auth: 'notesapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/threads/{threadId}',
      handler: handler.getThreadByIdHandler,
    },
  ]);
  
  module.exports = routes;
  