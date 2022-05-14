const NewThread = require('../NewThread');

describe('a NewThread entities',()=>{
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
          title: 'abc',
          body: 'abc',
        };
    
        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
      });
    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
          title: 123,
          body: true,
          owner: []
        };
    
        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
    it('should create newThread object correctly', () => {
        // Arrange
        const payload = {
            title: "sebuah thread",
            body: "body sebuah thread",
            owner: "user-DWrT3pXe1hccYkV1eIAxS"
        };
    
        // Action
        const { title, body, owner } = new NewThread(payload);
    
        // Assert
        expect(title).toEqual(payload.title);
        expect(body).toEqual(payload.body);
        expect(owner).toEqual(payload.owner);
    });
}); 