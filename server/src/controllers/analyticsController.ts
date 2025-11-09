import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?._id;

    // Base query for non-admin users
    const userQuery = isAdmin ? {} : { $or: [{ owner: userId }, { 'team.user': userId }] };

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      recentActivity,
      topContributors
    ] = await Promise.all([
      // Total projects
      Project.countDocuments(userQuery),
      
      // Active projects
      Project.countDocuments({ ...userQuery, status: 'active' }),
      
      // Total tasks
      Task.countDocuments(isAdmin ? {} : { assignedTo: userId }),
      
      // Tasks by status
      Task.aggregate([
        ...(isAdmin ? [] : [{ $match: { assignedTo: new mongoose.Types.ObjectId(userId as string) } }]),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Tasks by priority
      Task.aggregate([
        ...(isAdmin ? [] : [{ $match: { assignedTo: new mongoose.Types.ObjectId(userId as string) } }]),
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Overdue tasks
      Task.countDocuments({
        ...(isAdmin ? {} : { assignedTo: userId }),
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' }
      }),
      
      // Recent activity (last 10)
      AuditLog.find(isAdmin ? {} : { user: userId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Top contributors (Admin only)
      isAdmin ? Task.aggregate([
        {
          $match: {
            assignedTo: { $exists: true },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$assignedTo',
            completedTasks: { $sum: 1 }
          }
        },
        {
          $sort: { completedTasks: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            completedTasks: 1,
            name: '$user.name',
            email: '$user.email'
          }
        }
      ]) : []
    ]);

    res.json({
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        overdueTasks
      },
      tasksByStatus: tasksByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tasksByPriority: tasksByPriority.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity,
      topContributors
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message || 'Error fetching dashboard stats' });
  }
};

// Get project analytics
export const getProjectAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: 'Invalid project ID' });
      return;
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const [
      project,
      taskStats,
      completionRate,
      avgCompletionTime,
      teamActivity
    ] = await Promise.all([
      Project.findById(projectObjectId).populate('team.user', 'name email'),
      
      // Task statistics
      Task.aggregate([
        { $match: { project: projectObjectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
            },
            todo: {
              $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
            },
            inReview: {
              $sum: { $cond: [{ $eq: ['$status', 'in-review'] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', 'completed'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Completion rate over time
      Task.aggregate([
        { $match: { project: projectObjectId, status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$updatedAt' },
              month: { $month: '$updatedAt' },
              day: { $dayOfMonth: '$updatedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]),
      
      // Average completion time
      Task.aggregate([
        {
          $match: {
            project: projectObjectId,
            status: 'completed'
          }
        },
        {
          $project: {
            completionTime: {
              $subtract: ['$updatedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$completionTime' }
          }
        }
      ]),
      
      // Team member activity
      Task.aggregate([
        { $match: { project: projectObjectId } },
        {
          $group: {
            _id: '$assignedTo',
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            user: { $exists: true }
          }
        },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            totalTasks: 1,
            completedTasks: 1,
            completionRate: {
              $cond: [
                { $gt: ['$totalTasks', 0] },
                {
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100
                  ]
                },
                0
              ]
            }
          }
        }
      ])
    ]);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({
      project,
      taskStats: taskStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        inReview: 0,
        overdue: 0
      },
      completionRate,
      avgCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      teamActivity
    });
  } catch (error: any) {
    console.error('Project analytics error:', error);
    res.status(500).json({ message: error.message || 'Error fetching project analytics' });
  }
};

// Get user statistics
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const [totalTasks, completedTasks, inProgressTasks, overdueTasksCount] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({
        assignedTo: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' }
      })
    ]);

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks: overdueTasksCount,
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
    });
  } catch (error: any) {
    console.error('User stats error:', error);
    res.status(500).json({ message: error.message || 'Error fetching user statistics' });
  }
};
