
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';

dotenv.config();

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const users = [
      { name: 'Arnold', email: 'arnold@gmail.com', password: 'arnold123', role: 'admin' },
      { name: 'John Doe', email: 'john@gmail.com', password: 'john123', role: 'user' },
      { name: 'Jane Smith', email: 'jane@gmail.com', password: 'jane123', role: 'user' },
      { name: 'Mike Johnson', email: 'mike@gmail.com', password: 'mike123', role: 'user' },
      { name: 'Sarah Williams', email: 'sarah@gmail.com', password: 'sarah123', role: 'user' }
    ];

    for (const userData of users) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const user = await User.create(userData);
        console.log('✅ Created user:', user.email);
      } else {
        console.log('⚠️  User already exists:', userData.email);
      }
    }

    const allUsers = await User.find();
    console.log('\n👥 All Users:');
    allUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
