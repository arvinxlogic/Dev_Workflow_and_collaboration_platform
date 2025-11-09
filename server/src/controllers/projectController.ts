import { Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Get all projects
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    const query = isAdmin 
      ? {} 
      : { $or: [{ owner: userId }, { 'team.user': userId }] };

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('team.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('team.user', 'name email');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, team, startDate, endDate, priority } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user?._id,
      team: team || [],
      startDate,
      endDate,
      priority: priority || 'medium',
      status: 'active'
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('team.user', 'name email');

    res.status(201).json(populatedProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, team, status, startDate, endDate, priority } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Check if user is owner or admin
    const userId = req.user?._id;
    const isOwner = userId && project.owner.toString() === userId.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to update this project' });
      return;
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.team = team || project.team;
    project.status = status || project.status;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.priority = priority || project.priority;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('team.user', 'name email');

    res.json(updatedProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const userId = req.user?._id;
    const isOwner = userId && project.owner.toString() === userId.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this project' });
      return;
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};