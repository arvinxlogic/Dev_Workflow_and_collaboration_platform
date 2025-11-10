export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  team: Array<{ user: User; role: string }>;
  status: 'active' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  project: string;
  dueDate?: string;
  tags?: string[];
  isUserCompleted?: boolean; // ✅ ADDED
  userCompletedAt?: string; // ✅ ADDED
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    user: User;
    role: 'lead' | 'member';
  }>;
  projects: Project[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
