// import express from 'express';
// import {
//   getTasks,
//   getTask,
//   createTask,
//   updateTask,
//   updateTaskOrder,
//   deleteTask,
//   addComment
// } from '../controllers/taskController';
// import { protect, adminOnly } from '../middleware/auth';
// import { auditMiddleware } from '../middleware/auditLogger';

// const router = express.Router();

// router.use(protect);
// router.post('/', 
//   adminOnly, 
//   auditMiddleware('CREATE', 'task'),
//   createTask
// );

// router.put('/:id',
//   auditMiddleware('UPDATE', 'task'),
//   updateTask
// );

// router.delete('/:id',
//   adminOnly,
//   auditMiddleware('DELETE', 'task'),
//   deleteTask
// );
// router.route('/')
//   .get(getTasks)
//   .post(adminOnly, createTask);

// router.put('/reorder', updateTaskOrder);

// router.route('/:id')
//   .get(getTask)
//   .put(updateTask)
//   .delete(adminOnly, deleteTask);

// router.post('/:id/comments', addComment);

// export default router;
import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET routes - all users can view
router.get('/', getTasks);
router.get('/:id', getTask);

// POST/PUT/DELETE - admin only
router.post('/', adminOnly, createTask);
router.put('/:id', adminOnly, updateTask);
router.delete('/:id', adminOnly, deleteTask);

export default router;
