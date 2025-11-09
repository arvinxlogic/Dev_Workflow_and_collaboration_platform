import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Project from './src/models/Project';
import Task from './src/models/Task';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Get existing user (or create one)
    let user = await User.findOne({ email: 'ankush@gmail.com' });
    
    if (!user) {
      console.log('User not found, creating one...');
      user = await User.create({
        name: 'Ankush Kumar',
        email: 'ankush@gmail.com',
        password: 'test123', // Will be hashed by pre-save hook
        role: 'admin'
      });
      console.log('✅ User created:', user.email);
    }

    // Check if project already exists
    const existingProject = await Project.findOne({ name: 'Website Redesign' });
    if (existingProject) {
      console.log('⚠️  Sample project already exists!');
      process.exit(0);
    }

    // Create project
    const project = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI',
      owner: user._id,
      status: 'active',
      priority: 'high',
      team: [{ user: user._id, role: 'admin' }]
    });
    console.log('✅ Project created:', project.name);

    // Create tasks
    const tasks = await Task.create([
      {
        title: 'Design Homepage',
        description: 'Create mockups for homepage',
        project: project._id,
        assignedTo: user._id,
        status: 'todo',
        priority: 'high',
        createdBy: user._id,
        order: 0
      },
      {
        title: 'Setup Backend API',
        description: 'Create REST API endpoints',
        project: project._id,
        assignedTo: user._id,
        status: 'in-progress',
        priority: 'medium',
        createdBy: user._id,
        order: 1
      },
      {
        title: 'Write Documentation',
        description: 'Document all features',
        project: project._id,
        assignedTo: user._id,
        status: 'in-review',
        priority: 'low',
        createdBy: user._id,
        order: 2
      },
      {
        title: 'Deploy to Production',
        description: 'Deploy app to production server',
        project: project._id,
        status: 'completed',
        priority: 'urgent',
        createdBy: user._id,
        order: 3
      }
    ]);
    console.log('✅ Tasks created:', tasks.length);

    console.log('\n🎉 Sample data created successfully!');
    console.log('📧 Email: ankush@gmail.com');
    console.log('🔑 Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
