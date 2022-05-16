const NewThreadComment = require('../NewThreadComment');

describe('a NewThreadComment entities',()=>{
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
          content: 'abc',
        };
    
        // Action and Assert
        expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
      });
    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
          content: 123,
          thread_id: true,
          owner: []
        };
    
        // Action and Assert
        expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
    it('should create newThreadComment object correctly', () => {
        // Arrange
        const payload = {
            content: "content dari sebuah thread",
            thread_id: "thread-DWrT3pXe1hccYkV1eIAxSd",
            owner: "user-DWrT3pXe1hccYkV1eIAxS"
        };
    
        // Action
        const { content, thread_id, owner } = new NewThreadComment(payload);
    
        // Assert
        expect(content).toEqual(payload.content);
        expect(thread_id).toEqual(payload.thread_id);
        expect(owner).toEqual(payload.owner);
    });
}); 