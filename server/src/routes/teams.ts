import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import Team from '../models/Team';

const router = express.Router();

router.use(protect);

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members.user', 'name email')
      .populate('projects')
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('projects');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create team (admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const team = await Team.create({
      name,
      description,
      members: members || []
    });
    
    const populatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email');
    
    res.status(201).json(populatedTeam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update team (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true }
    ).populate('members.user', 'name email');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete team (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
