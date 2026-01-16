const mongoose = require('mongoose');
const Note = require('./models/Note');
require('dotenv').config();

/**
 * Test script to verify Note model and create sample notes
 */

const testNotes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes');
    console.log('✅ Connected to MongoDB');

    // Get sample user ID (you'll need to replace this with an actual user ID from your database)
    const User = require('./models/User');
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Testing with user: ${user.email}`);

    // Create sample notes with gradient colors
    const sampleNotes = [
      {
        title: 'Welcome to Notes App',
        content: 'This is your first note! You can edit, pin, archive, or delete it.',
        user: user._id,
        tags: ['welcome', 'tutorial'],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        isPinned: true
      },
      {
        title: 'Meeting Notes - Jan 15',
        content: 'Discussed Q1 objectives:\n- Launch new feature\n- Improve performance\n- User feedback integration',
        user: user._id,
        tags: ['work', 'meeting'],
        color: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
      },
      {
        title: 'Shopping List',
        content: '- Milk\n- Eggs\n- Bread\n- Coffee\n- Fruits',
        user: user._id,
        tags: ['personal', 'shopping'],
        color: 'linear-gradient(135deg, #14b8a6 0%, #059669 100%)'
      },
      {
        title: 'Project Ideas',
        content: '1. AI-powered task manager\n2. Social recipe sharing platform\n3. Fitness tracking app',
        user: user._id,
        tags: ['ideas', 'projects'],
        color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        isPinned: true
      },
      {
        title: 'Book Recommendations',
        content: '- Atomic Habits by James Clear\n- The Lean Startup by Eric Ries\n- Deep Work by Cal Newport',
        user: user._id,
        tags: ['personal', 'books', 'reading'],
        color: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
      },
      {
        title: 'Workout Plan',
        content: 'Weekly fitness routine:\n- Monday: Chest & Triceps\n- Wednesday: Back & Biceps\n- Friday: Legs & Shoulders',
        user: user._id,
        tags: ['fitness', 'health', 'personal'],
        color: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
      },
      {
        title: 'Travel Destinations 2026',
        content: 'Places to visit:\n- Japan (Cherry Blossom Season)\n- Switzerland (Alps)\n- New Zealand (Hiking trails)',
        user: user._id,
        tags: ['travel', 'bucket-list'],
        color: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
      },
      {
        title: 'Coding Reminders',
        content: 'Best practices:\n- Write clean, readable code\n- Add meaningful comments\n- Test thoroughly\n- Commit often',
        user: user._id,
        tags: ['coding', 'development', 'tips'],
        color: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)'
      }
    ];

    // Clear existing notes for this user
    const deleteResult = await Note.deleteMany({ user: user._id });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing notes`);

    // Create new notes
    const createdNotes = await Note.insertMany(sampleNotes);
    console.log(`✨ Created ${createdNotes.length} sample notes`);

    // Display created notes
    console.log('\n📋 Created Notes:');
    createdNotes.forEach((note, index) => {
      console.log(`\n${index + 1}. ${note.title}`);
      console.log(`   ID: ${note._id}`);
      console.log(`   Tags: ${note.tags.join(', ')}`);
      console.log(`   Pinned: ${note.isPinned ? 'Yes' : 'No'}`);
      console.log(`   Color: ${note.color}`);
    });

    // Test queries
    console.log('\n🔍 Testing Queries:');
    
    // Get all notes
    const allNotes = await Note.find({ user: user._id });
    console.log(`   Total notes: ${allNotes.length}`);

    // Get pinned notes
    const pinnedNotes = await Note.find({ user: user._id, isPinned: true });
    console.log(`   Pinned notes: ${pinnedNotes.length}`);

    // Search notes
    const searchResults = await Note.find({
      user: user._id,
      $or: [
        { title: { $regex: 'project', $options: 'i' } },
        { content: { $regex: 'project', $options: 'i' } }
      ]
    });
    console.log(`   Notes containing "project": ${searchResults.length}`);

    // Get notes by tag
    const workNotes = await Note.find({ user: user._id, tags: 'work' });
    console.log(`   Notes with "work" tag: ${workNotes.length}`);

    console.log('\n✅ All tests passed!');
    console.log('\n💡 You can now test the API endpoints using the access token from login.');
    console.log('   Example: GET http://localhost:5000/api/notes');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testNotes();
