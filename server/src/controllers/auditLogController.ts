import { Response } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

// Get audit logs (Admin only)
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, entity, action, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query: any = {};

    if (userId) query.user = userId;
    if (entity) query.entity = entity;
    if (action) query.action = action;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user activity summary
export const getUserActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activity = await AuditLog.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            entity: '$entity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
