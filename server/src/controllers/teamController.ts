import { Response } from 'express';
import Team from '../models/Team';
import { AuthRequest } from '../middleware/auth';

// Get all teams
export const getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'name email avatar')
      .populate('projects', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get single team
export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('projects', 'name status priority')
      .populate('createdBy', 'name email');

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create team (Admin only)
export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, members, projects } = req.body;

    const team = await Team.create({
      name,
      description,
      members: members || [],
      projects: projects || [],
      createdBy: req.user?._id
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar')
      .populate('projects', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTeam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update team (Admin only)
export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, members, projects } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    team.name = name || team.name;
    team.description = description || team.description;
    team.members = members || team.members;
    team.projects = projects || team.projects;

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar')
      .populate('projects', 'name')
      .populate('createdBy', 'name email');

    res.json(updatedTeam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete team (Admin only)
export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
