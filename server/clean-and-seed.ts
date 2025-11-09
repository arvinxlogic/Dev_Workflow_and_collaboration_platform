import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Project from './src/models/Project';
import Task from './src/models/Task';
import Team from './src/models/Team';

dotenv.config();

async function cleanAndSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Delete all existing data
    console.log('🗑️  Cleaning old data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Team.deleteMany({});
    console.log('✅ Old data deleted');

    // Create new user: arnold@gmail.com
    console.log('👤 Creating user: arnold@gmail.com');
    const user = await User.create({
      name: 'Arnold',
      email: 'arnold@gmail.com',
      password: 'arnold123', // Will be hashed automatically
      role: 'admin'
    });
    console.log('✅ User created:', user.email);

    // Create projects
    console.log('📁 Creating projects...');
    
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI',
      owner: user._id,
      status: 'active',
      priority: 'high',
      team: [{ user: user._id, role: 'admin' }]
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Build iOS and Android app',
      owner: user._id,
      status: 'active',
      priority: 'urgent',
      team: [{ user: user._id, role: 'admin' }]
    });

    const project3 = await Project.create({
      name: 'Marketing Campaign',
      description: 'Q4 marketing strategy',
      owner: user._id,
      status: 'active',
      priority: 'medium',
      team: [{ user: user._id, role: 'admin' }]
    });

    const project4 = await Project.create({
      name: 'Database Migration',
      description: 'Migrate to MongoDB Atlas',
      owner: user._id,
      status: 'completed',
      priority: 'high',
      team: [{ user: user._id, role: 'admin' }]
    });

    console.log('✅ Created 4 projects');

    // Create tasks for each project
    console.log('📝 Creating tasks...');
    
    // Project 1 tasks
    await Task.create([
      {
        title: 'Design Homepage',
        description: 'Create mockups for homepage',
        project: project1._id,
        assignedTo: user._id,
        status: 'todo',
        priority: 'high',
        createdBy: user._id,
        order: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Setup Backend API',
        description: 'Create REST API endpoints',
        project: project1._id,
        assignedTo: user._id,
        status: 'in-progress',
        priority: 'medium',
        createdBy: user._id,
        order: 1,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Write Documentation',
        description: 'Document all features',
        project: project1._id,
        assignedTo: user._id,
        status: 'in-review',
        priority: 'low',
        createdBy: user._id,
        order: 2,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Deploy to Production',
        description: 'Deploy app to production server',
        project: project1._id,
        status: 'completed',
        priority: 'urgent',
        createdBy: user._id,
        order: 3,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Project 2 tasks
    await Task.create([
      {
        title: 'iOS App Development',
        project: project2._id,
        assignedTo: user._id,
        status: 'in-progress',
        priority: 'urgent',
        createdBy: user._id,
        order: 0
      },
      {
        title: 'Android App Development',
        project: project2._id,
        assignedTo: user._id,
        status: 'todo',
        priority: 'high',
        createdBy: user._id,
        order: 1
      }
    ]);

    // Project 3 tasks
    await Task.create([
      {
        title: 'Social Media Strategy',
        project: project3._id,
        assignedTo: user._id,
        status: 'todo',
        priority: 'medium',
        createdBy: user._id,
        order: 0
      },
      {
        title: 'Email Campaign',
        project: project3._id,
        status: 'in-review',
        priority: 'medium',
        createdBy: user._id,
        order: 1
      }
    ]);

    // Project 4 tasks (completed)
    await Task.create([
      {
        title: 'Data Backup',
        project: project4._id,
        status: 'completed',
        priority: 'high',
        createdBy: user._id,
        order: 0
      },
      {
        title: 'Migration Script',
        project: project4._id,
        status: 'completed',
        priority: 'high',
        createdBy: user._id,
        order: 1
      }
    ]);

    console.log('✅ Created 10 tasks across all projects');

    console.log('\n🎉 Database reset and seeded successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email: arnold@gmail.com');
    console.log('🔑 Password: arnold123');
    console.log('👤 Role: admin');
    console.log('📁 Projects: 4');
    console.log('📝 Tasks: 10');
    console.log('═══════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanAndSeed();
