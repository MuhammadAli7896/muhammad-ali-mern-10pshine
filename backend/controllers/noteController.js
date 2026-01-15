const Note = require('../models/Note');
const { sendSuccess, sendError, asyncHandler } = require('../utils/responseHandler');

/**
 * @route   GET /api/notes
 * @desc    Get all notes for the authenticated user
 * @access  Private
 */
const getNotes = asyncHandler(async (req, res) => {
  const { 
    search, 
    tags, 
    isPinned, 
    isArchived,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50
  } = req.query;

  // Build query
  const query = { user: req.userId };

  // Search in title and content
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by tags
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    query.tags = { $in: tagArray };
  }

  // Filter by pinned status
  if (isPinned !== undefined) {
    query.isPinned = isPinned === 'true';
  }

  // Filter by archived status
  if (isArchived !== undefined) {
    query.isArchived = isArchived === 'true';
  } else {
    // By default, don't show archived notes
    query.isArchived = false;
  }

  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query with pagination
  const notes = await Note.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  // Get total count for pagination
  const total = await Note.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  sendSuccess(res, 200, 'Notes retrieved successfully', {
    notes,
    pagination: {
      currentPage: pageNum,
      totalPages: totalPages,
      totalNotes: total,
      hasMore: pageNum < totalPages
    }
  });
});

/**
 * @route   GET /api/notes/:id
 * @desc    Get a single note by ID
 * @access  Private
 */
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.userId
  }).select('-__v');

  if (!note) {
    return sendError(res, 404, 'Note not found');
  }

  sendSuccess(res, 200, 'Note retrieved successfully', { note });
});

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, color, isPinned } = req.body;

  // Validation
  if (!title || !content) {
    return sendError(res, 400, 'Title and content are required');
  }

  if (title.length > 200) {
    return sendError(res, 400, 'Title cannot exceed 200 characters');
  }

  // Create note
  const note = await Note.create({
    title,
    content,
    user: req.userId,
    tags: tags || [],
    color: color || '#ffffff',
    isPinned: isPinned || false
  });

  sendSuccess(res, 201, 'Note created successfully', { note });
});

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note
 * @access  Private
 */
const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags, color, isPinned, isArchived } = req.body;

  // Find note and check ownership
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.userId
  });

  if (!note) {
    return sendError(res, 404, 'Note not found');
  }

  // Validation
  if (title !== undefined && title.length > 200) {
    return sendError(res, 400, 'Title cannot exceed 200 characters');
  }

  // Update fields
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (color !== undefined) note.color = color;
  if (isPinned !== undefined) note.isPinned = isPinned;
  if (isArchived !== undefined) note.isArchived = isArchived;

  await note.save();

  sendSuccess(res, 200, 'Note updated successfully', { note });
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note
 * @access  Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.userId
  });

  if (!note) {
    return sendError(res, 404, 'Note not found');
  }

  sendSuccess(res, 200, 'Note deleted successfully');
});

/**
 * @route   PATCH /api/notes/:id/pin
 * @desc    Toggle pin status of a note
 * @access  Private
 */
const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.userId
  });

  if (!note) {
    return sendError(res, 404, 'Note not found');
  }

  note.isPinned = !note.isPinned;
  await note.save();

  sendSuccess(res, 200, `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`, { note });
});

/**
 * @route   PATCH /api/notes/:id/archive
 * @desc    Toggle archive status of a note
 * @access  Private
 */
const toggleArchive = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.userId
  });

  if (!note) {
    return sendError(res, 404, 'Note not found');
  }

  note.isArchived = !note.isArchived;
  await note.save();

  sendSuccess(res, 200, `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`, { note });
});

/**
 * @route   GET /api/notes/stats
 * @desc    Get notes statistics for the user
 * @access  Private
 */
const getNotesStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const stats = await Note.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pinned: {
          $sum: { $cond: ['$isPinned', 1, 0] }
        },
        archived: {
          $sum: { $cond: ['$isArchived', 1, 0] }
        },
        active: {
          $sum: { $cond: ['$isArchived', 0, 1] }
        }
      }
    }
  ]);

  // Get unique tags
  const tagsResult = await Note.aggregate([
    { $match: { user: userId } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const result = stats.length > 0 ? stats[0] : {
    total: 0,
    pinned: 0,
    archived: 0,
    active: 0
  };

  sendSuccess(res, 200, 'Statistics retrieved successfully', {
    stats: result,
    topTags: tagsResult.map(t => ({ tag: t._id, count: t.count }))
  });
});

/**
 * @route   DELETE /api/notes
 * @desc    Delete multiple notes
 * @access  Private
 */
const deleteMultipleNotes = asyncHandler(async (req, res) => {
  const { noteIds } = req.body;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    return sendError(res, 400, 'Please provide an array of note IDs');
  }

  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    user: req.userId
  });

  sendSuccess(res, 200, `${result.deletedCount} note(s) deleted successfully`, {
    deletedCount: result.deletedCount
  });
});

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  getNotesStats,
  deleteMultipleNotes
};
