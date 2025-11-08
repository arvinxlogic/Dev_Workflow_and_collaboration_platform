export enum UserRole {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  MEMBER = "MEMBER",
}

export interface UserWithRole {
  userId: number;
  cognitoId: string;
  username: string;
  profilePictureUrl?: string;
  teamId?: number;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
