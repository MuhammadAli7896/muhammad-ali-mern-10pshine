const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    validate: {
      validator: function(v) {
        // Allow hex colors or gradient strings
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v) || 
               /^linear-gradient\(/.test(v);
      },
      message: 'Invalid color format. Must be hex color or CSS gradient'
    }
  },
}, {
  timestamps: true,
});

// Index for faster queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ tags: 1 });

// Virtual for formatted date
noteSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Ensure virtuals are included in JSON
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema);
