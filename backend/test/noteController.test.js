const { expect } = require('chai');
const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');
const noteController = require('../controllers/noteController');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes with auth middleware mock
const createAuthRoute = (path, method, controller) => {
  app[method](path, async (req, res, next) => {
    // Mock auth middleware - set userId from header
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // Store as ObjectId for aggregation queries
    req.userId = new mongoose.Types.ObjectId(userId);
    next();
  }, controller);
};

createAuthRoute('/api/notes', 'get', noteController.getNotes);
createAuthRoute('/api/notes', 'post', noteController.createNote);
createAuthRoute('/api/notes/stats', 'get', noteController.getNotesStats);
createAuthRoute('/api/notes/delete-multiple', 'delete', noteController.deleteMultipleNotes);
createAuthRoute('/api/notes/:id', 'get', noteController.getNoteById);
createAuthRoute('/api/notes/:id', 'put', noteController.updateNote);
createAuthRoute('/api/notes/:id', 'delete', noteController.deleteNote);
createAuthRoute('/api/notes/:id/pin', 'patch', noteController.togglePin);
createAuthRoute('/api/notes/:id/archive', 'patch', noteController.toggleArchive);

describe('Note Controller', () => {
  let mongoServer;
  let testUser;
  let testUserId;

  before(async function() {
    this.timeout(30000);
    
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect mongoose to in-memory database
    await mongoose.connect(mongoUri);
  });

  after(async function() {
    this.timeout(30000);
    
    // Close mongoose connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    testUserId = testUser._id.toString();
  });

  describe('POST /api/notes', () => {
    it('should create a new note successfully', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('x-user-id', testUserId)
        .send({
          title: 'Test Note',
          content: 'This is test content',
          tags: ['work', 'important']
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note created successfully');
      expect(res.body.data.note.title).to.equal('Test Note');
      expect(res.body.data.note.content).to.equal('This is test content');
      expect(res.body.data.note.tags).to.deep.equal(['work', 'important']);
      expect(res.body.data.note.isPinned).to.be.false;
      expect(res.body.data.note.isArchived).to.be.false;
    });

    it('should return error if title is missing', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('x-user-id', testUserId)
        .send({
          content: 'This is test content'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return error if content is missing', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('x-user-id', testUserId)
        .send({
          title: 'Test Note'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Title and content are required');
    });

    it('should return error if title is too long', async () => {
      const longTitle = 'a'.repeat(201);
      
      const res = await request(app)
        .post('/api/notes')
        .set('x-user-id', testUserId)
        .send({
          title: longTitle,
          content: 'Test content'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Title cannot exceed 200 characters');
    });

    it('should create note without tags', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('x-user-id', testUserId)
        .send({
          title: 'Test Note',
          content: 'This is test content'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.note.tags).to.deep.equal([]);
    });
  });

  describe('GET /api/notes', () => {
    beforeEach(async () => {
      // Create multiple test notes
      await Note.create([
        {
          title: 'First Note',
          content: 'First content',
          tags: ['work'],
          user: testUserId,
          isPinned: true,
          isArchived: false
        },
        {
          title: 'Second Note',
          content: 'Second content',
          tags: ['personal'],
          user: testUserId,
          isPinned: false,
          isArchived: false
        },
        {
          title: 'Archived Note',
          content: 'Archived content',
          tags: ['work'],
          user: testUserId,
          isPinned: false,
          isArchived: true
        }
      ]);
    });

    it('should get all notes for user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(2); // Archived excluded by default
      expect(res.body.data.pagination.totalNotes).to.equal(2);
      expect(res.body.data.pagination.currentPage).to.equal(1);
    });

    it('should filter notes by search query', async () => {
      const res = await request(app)
        .get('/api/notes?search=First')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(1);
      expect(res.body.data.notes[0].title).to.equal('First Note');
    });

    it('should filter notes by tags', async () => {
      const res = await request(app)
        .get('/api/notes?tags=work')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(1); // Only non-archived work note
      expect(res.body.data.notes[0].title).to.equal('First Note');
    });

    it('should filter pinned notes', async () => {
      const res = await request(app)
        .get('/api/notes?isPinned=true')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(1);
      expect(res.body.data.notes[0].isPinned).to.be.true;
    });

    it('should filter archived notes', async () => {
      const res = await request(app)
        .get('/api/notes?isArchived=true')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(1);
      expect(res.body.data.notes[0].isArchived).to.be.true;
    });

    it('should paginate results', async () => {
      // Create more notes
      for (let i = 0; i < 10; i++) {
        await Note.create({
          title: `Note ${i}`,
          content: `Content ${i}`,
          user: testUserId
        });
      }

      const res = await request(app)
        .get('/api/notes?page=1&limit=5')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.have.lengthOf(5);
      expect(res.body.data.pagination.totalPages).to.be.at.least(2);
    });
  });

  describe('GET /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await Note.create({
        title: 'Test Note',
        content: 'Test content',
        user: testUserId
      });
    });

    it('should get note by id', async () => {
      const res = await request(app)
        .get(`/api/notes/${testNote._id}`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.note.title).to.equal('Test Note');
    });

    it('should return error if note not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .get(`/api/notes/${fakeId}`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });

    it('should return error if accessing another user note', async () => {
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .get(`/api/notes/${testNote._id}`)
        .set('x-user-id', anotherUser._id.toString());

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });
  });

  describe('PUT /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await Note.create({
        title: 'Original Title',
        content: 'Original content',
        tags: ['old'],
        user: testUserId
      });
    });

    it('should update note successfully', async () => {
      const res = await request(app)
        .put(`/api/notes/${testNote._id}`)
        .set('x-user-id', testUserId)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
          tags: ['new', 'updated']
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note updated successfully');
      expect(res.body.data.note.title).to.equal('Updated Title');
      expect(res.body.data.note.content).to.equal('Updated content');
      expect(res.body.data.note.tags).to.deep.equal(['new', 'updated']);
    });

    it('should return error if note not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .put(`/api/notes/${fakeId}`)
        .set('x-user-id', testUserId)
        .send({
          title: 'Updated Title',
          content: 'Updated content'
        });

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });

    it('should return error if title is too long', async () => {
      const longTitle = 'a'.repeat(201);
      
      const res = await request(app)
        .put(`/api/notes/${testNote._id}`)
        .set('x-user-id', testUserId)
        .send({
          title: longTitle,
          content: 'Updated content'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Title cannot exceed 200 characters');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await Note.create({
        title: 'Test Note',
        content: 'Test content',
        user: testUserId
      });
    });

    it('should delete note successfully', async () => {
      const res = await request(app)
        .delete(`/api/notes/${testNote._id}`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note deleted successfully');

      // Verify note is deleted
      const deletedNote = await Note.findById(testNote._id);
      expect(deletedNote).to.be.null;
    });

    it('should return error if note not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .delete(`/api/notes/${fakeId}`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });
  });

  describe('PATCH /api/notes/:id/pin', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await Note.create({
        title: 'Test Note',
        content: 'Test content',
        user: testUserId,
        isPinned: false
      });
    });

    it('should pin note successfully', async () => {
      const res = await request(app)
        .patch(`/api/notes/${testNote._id}/pin`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note pinned successfully');
      expect(res.body.data.note.isPinned).to.be.true;
    });

    it('should unpin note when already pinned', async () => {
      testNote.isPinned = true;
      await testNote.save();

      const res = await request(app)
        .patch(`/api/notes/${testNote._id}/pin`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note unpinned successfully');
      expect(res.body.data.note.isPinned).to.be.false;
    });

    it('should return error if note not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .patch(`/api/notes/${fakeId}/pin`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });
  });

  describe('PATCH /api/notes/:id/archive', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await Note.create({
        title: 'Test Note',
        content: 'Test content',
        user: testUserId,
        isArchived: false
      });
    });

    it('should archive note successfully', async () => {
      const res = await request(app)
        .patch(`/api/notes/${testNote._id}/archive`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note archived successfully');
      expect(res.body.data.note.isArchived).to.be.true;
    });

    it('should unarchive note when already archived', async () => {
      testNote.isArchived = true;
      await testNote.save();

      const res = await request(app)
        .patch(`/api/notes/${testNote._id}/archive`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Note unarchived successfully');
      expect(res.body.data.note.isArchived).to.be.false;
    });

    it('should return error if note not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .patch(`/api/notes/${fakeId}/archive`)
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Note not found');
    });
  });

  describe('GET /api/notes/stats', () => {
    beforeEach(async () => {
      await Note.create([
        {
          title: 'Pinned Note',
          content: 'Content',
          tags: ['work', 'urgent'],
          user: testUserId,
          isPinned: true,
          isArchived: false
        },
        {
          title: 'Archived Note',
          content: 'Content',
          tags: ['personal'],
          user: testUserId,
          isPinned: false,
          isArchived: true
        },
        {
          title: 'Active Note 1',
          content: 'Content',
          tags: ['work'],
          user: testUserId,
          isPinned: false,
          isArchived: false
        },
        {
          title: 'Active Note 2',
          content: 'Content',
          tags: ['work', 'project'],
          user: testUserId,
          isPinned: false,
          isArchived: false
        }
      ]);
    });

    it('should get notes statistics', async () => {
      const res = await request(app)
        .get('/api/notes/stats')
        .set('x-user-id', testUserId);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.stats.total).to.equal(4);
      expect(res.body.data.stats.pinned).to.equal(1);
      expect(res.body.data.stats.archived).to.equal(1);
      expect(res.body.data.stats.active).to.equal(3);
      expect(res.body.data.topTags).to.be.an('array');
      
      // Check if work tag has highest count
      const workTag = res.body.data.topTags.find(t => t.tag === 'work');
      expect(workTag).to.exist;
      expect(workTag.count).to.equal(3);
    });
  });

  describe('DELETE /api/notes/delete-multiple', () => {
    let note1, note2, note3;

    beforeEach(async () => {
      note1 = await Note.create({
        title: 'Note 1',
        content: 'Content 1',
        user: testUserId
      });
      note2 = await Note.create({
        title: 'Note 2',
        content: 'Content 2',
        user: testUserId
      });
      note3 = await Note.create({
        title: 'Note 3',
        content: 'Content 3',
        user: testUserId
      });
    });

    it('should delete multiple notes successfully', async () => {
      const res = await request(app)
        .delete('/api/notes/delete-multiple')
        .set('x-user-id', testUserId)
        .send({
          noteIds: [note1._id.toString(), note2._id.toString()]
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('2 note(s) deleted successfully');

      // Verify notes are deleted
      const remainingNotes = await Note.find({ user: testUserId });
      expect(remainingNotes).to.have.lengthOf(1);
      expect(remainingNotes[0].title).to.equal('Note 3');
    });

    it('should return error if no ids provided', async () => {
      const res = await request(app)
        .delete('/api/notes/delete-multiple')
        .set('x-user-id', testUserId)
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide an array of note IDs');
    });

    it('should return error if ids is not an array', async () => {
      const res = await request(app)
        .delete('/api/notes/delete-multiple')
        .set('x-user-id', testUserId)
        .send({
          noteIds: 'not-an-array'
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Please provide an array of note IDs');
    });
  });
});
