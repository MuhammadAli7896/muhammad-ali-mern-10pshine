require('dotenv').config();
const { connectDB, getDBStats, listCollections } = require('./config/database');
const User = require('./models/User');
const Note = require('./models/Note');

/**
 * Test database connection and models
 */
async function testDatabase() {
  console.log('🧪 Testing Database Connection...\n');

  try {
    // Connect to database
    await connectDB();
    console.log('\n✅ Connection successful!\n');

    // Get database stats
    console.log('📊 Database Statistics:');
    const stats = await getDBStats();
    if (stats) {
      console.log(`   Database: ${stats.database}`);
      console.log(`   Collections: ${stats.collections}`);
      console.log(`   Data Size: ${stats.dataSize}`);
      console.log(`   Index Size: ${stats.indexSize}`);
    }
    console.log('');

    // List collections
    console.log('📂 Collections:');
    const collections = await listCollections();
    collections.forEach(col => console.log(`   - ${col}`));
    console.log('');

    // Count documents
    console.log('📝 Document Counts:');
    const userCount = await User.countDocuments();
    const noteCount = await Note.countDocuments();
    console.log(`   Users: ${userCount}`);
    console.log(`   Notes: ${noteCount}`);
    console.log('');

    // Test model schemas
    console.log('🔍 Testing Schemas:');
    console.log('   ✓ User model loaded');
    console.log('   ✓ Note model loaded');
    console.log('');

    console.log('✅ All tests passed!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testDatabase();
