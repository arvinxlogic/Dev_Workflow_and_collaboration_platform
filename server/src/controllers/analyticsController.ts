import { Response } from 'express';
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
        ...(isAdmin ? [] : [{ $match: { assignedTo: userId } }]),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Tasks by priority
      Task.aggregate([
        ...(isAdmin ? [] : [{ $match: { assignedTo: userId } }]),
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
    res.status(500).json({ message: error.message });
  }
};

// Get project analytics
export const getProjectAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const [
      project,
      taskStats,
      completionRate,
      avgCompletionTime,
      teamActivity
    ] = await Promise.all([
      Project.findById(projectId).populate('team.user', 'name email'),
      
      // Task statistics
      Task.aggregate([
        { $match: { project: projectId } },
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
        { $match: { project: projectId, status: 'completed' } },
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
            project: projectId,
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
        { $match: { project: projectId } },
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
        { $unwind: '$user' },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            totalTasks: 1,
            completedTasks: 1,
            completionRate: {
              $multiply: [
                { $divide: ['$completedTasks', '$totalTasks'] },
                100
              ]
            }
          }
        }
      ])
    ]);

    res.json({
      project,
      taskStats: taskStats[0] || {},
      completionRate,
      avgCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      teamActivity
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
