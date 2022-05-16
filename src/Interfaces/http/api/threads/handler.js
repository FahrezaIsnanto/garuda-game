const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddThreadCommentUseCase = require('../../../../Applications/use_case/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../../../../Applications/use_case/DeleteThreadCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postThreadCommentByIdHandler = this.postThreadCommentByIdHandler.bind(this);
    this.deleteThreadCommentByThreadAndCommentIdHandler = this.deleteThreadCommentByThreadAndCommentIdHandler.bind(this);
    this.getThreadByIdHandler  = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    request.payload.owner = request.auth.credentials.id;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload);
    

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postThreadCommentByIdHandler(request, h) {
    const { thread_id } = request.params;
    request.payload.thread_id = thread_id;
    request.payload.owner = request.auth.credentials.id;

    const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const addedComment = await addThreadCommentUseCase.execute(request.payload);
    

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentByThreadAndCommentIdHandler(request, h){
    const { comment_id,thread_id } = request.params;
    const owner = request.auth.credentials.id;
    const payload = {
      comment_id,
      thread_id,
      owner
    }

    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
    const result = await deleteThreadCommentUseCase.execute(payload);
    const response = h.response({
      status: 'success',
      data: result
    });
    response.code(200);
    return response;
  }

  async getThreadByIdHandler(request,h){
    const {thread_id}  = request.params;
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const thread = await getThreadUseCase.execute(thread_id);

    const response = h.response({
      status: 'success',
      data: {thread}
    });
    response.code(200);
    return response;

  }

}

module.exports = ThreadsHandler;
