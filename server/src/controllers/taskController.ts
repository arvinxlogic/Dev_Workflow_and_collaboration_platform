import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            id: "desc",
          },
        },
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        points,
        projectId: Number(projectId),
        authorUserId: Number(authorUserId),
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    assignedUserId,
  } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(tags !== undefined && { tags }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(points !== undefined && { points: Number(points) }),
        ...(assignedUserId !== undefined && {
          assignedUserId: assignedUserId ? Number(assignedUserId) : null,
        }),
      },
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;

  try {
    // Delete related records first
    await prisma.comment.deleteMany({
      where: { taskId: Number(taskId) },
    });

    await prisma.attachment.deleteMany({
      where: { taskId: Number(taskId) },
    });

    await prisma.taskAssignment.deleteMany({
      where: { taskId: Number(taskId) },
    });

    // Then delete the task
    await prisma.task.delete({
      where: {
        id: Number(taskId),
      },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
        project: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};

// COMMENT FUNCTIONALITY
export const getTaskComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        taskId: Number(taskId),
      },
      include: {
        user: true,
      },
      orderBy: {
        id: "desc",
      },
    });
    res.json(comments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving comments: ${error.message}` });
  }
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { text, taskId, userId } = req.body;

  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        taskId: Number(taskId),
        userId: Number(userId),
      },
      include: {
        user: true,
      },
    });
    res.status(201).json(newComment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating comment: ${error.message}` });
  }
};
