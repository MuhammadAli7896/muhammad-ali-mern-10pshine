const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  getNotesStats,
  deleteMultipleNotes
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id to avoid treating 'stats' as an id)
router.get('/stats', getNotesStats);

// Main CRUD routes
router.route('/')
  .get(getNotes)           // Get all notes with filters
  .post(createNote)        // Create a new note
  .delete(deleteMultipleNotes); // Delete multiple notes

router.route('/:id')
  .get(getNoteById)        // Get single note
  .put(updateNote)         // Update note
  .delete(deleteNote);     // Delete note

// Special actions
router.patch('/:id/pin', togglePin);           // Toggle pin status
router.patch('/:id/archive', toggleArchive);   // Toggle archive status

module.exports = router;
