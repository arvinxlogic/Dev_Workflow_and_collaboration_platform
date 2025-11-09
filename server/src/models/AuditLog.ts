import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  entity: 'user' | 'project' | 'task' | 'team';
  entityId?: mongoose.Types.ObjectId;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
      'ASSIGN_TASK', 'COMPLETE_TASK', 'CHANGE_STATUS',
      'ADD_COMMENT', 'UPLOAD_FILE', 'CHANGE_ROLE'
    ]
  },
  entity: {
    type: String,
    required: true,
    enum: ['user', 'project', 'task', 'team']
  },
  entityId: {
    type: Schema.Types.ObjectId
  },
  changes: {
    type: Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  // TTL index - logs will be automatically deleted after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60
});

// Index for faster queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
