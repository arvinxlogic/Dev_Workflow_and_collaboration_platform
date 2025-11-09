import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Project from './src/models/Project';
import Task from './src/models/Task';

dotenv.config();

async function seedMore() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'ankush@gmail.com' });
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    const projects = [
      {
        name: 'Mobile App Development',
        description: 'Build iOS and Android app',
        priority: 'urgent',
        status: 'active'
      },
      {
        name: 'Marketing Campaign',
        description: 'Q4 marketing strategy',
        priority: 'medium',
        status: 'active'
      },
      {
        name: 'Database Migration',
        description: 'Migrate to MongoDB',
        priority: 'high',
        status: 'completed'
      }
    ];

    for (const projectData of projects) {
      const project = await Project.create({
        ...projectData,
        owner: user._id,
        team: [{ user: user._id, role: 'admin' }]
      });

      await Task.create([
        {
          title: `${projectData.name} - Planning`,
          project: project._id,
          assignedTo: user._id,
          status: 'todo',
          priority: 'high',
          createdBy: user._id,
          order: 0
        },
        {
          title: `${projectData.name} - Implementation`,
          project: project._id,
          assignedTo: user._id,
          status: 'in-progress',
          priority: 'medium',
          createdBy: user._id,
          order: 1
        }
      ]);
    }

    console.log('✅ Created 3 more projects with tasks!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedMore();
