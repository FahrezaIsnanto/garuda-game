const AddedThreadComment = require('../AddedThreadComment');

describe('a AddedThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'title_test',
      owner: 'owner_test'
    };

    // Action and Assert
    expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: [],
      owner: true
    };

    // Action and Assert
    expect(() => new AddedThreadComment(payload)).toThrowError('ADDED_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThreadComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'content-test',
      owner: 'user_test'
    };

    // Action
    const addedThreadComment = new AddedThreadComment(payload);

    // Assert
    expect(addedThreadComment.id).toEqual(payload.id);
    expect(addedThreadComment.content).toEqual(payload.content);
    expect(addedThreadComment.owner).toEqual(payload.owner);
  });
});
