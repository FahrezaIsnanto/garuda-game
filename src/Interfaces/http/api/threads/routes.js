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
      path: '/threads/{thread_id}/comments',
      handler: handler.postThreadCommentByIdHandler,
      options: {
        auth: 'notesapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/threads/{thread_id}/comments/{comment_id}',
      handler: handler.deleteThreadCommentByThreadAndCommentIdHandler,
      options: {
        auth: 'notesapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/threads/{thread_id}',
      handler: handler.getThreadByIdHandler,
    },
  ]);
  
  module.exports = routes;
  