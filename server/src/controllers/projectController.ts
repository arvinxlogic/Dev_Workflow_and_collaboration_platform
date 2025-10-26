import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(newProject);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const { name, description, startDate, endDate } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
    res.json(updatedProject);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating project: ${error.message}` });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;

  try {
    // Get all tasks for this project
    const tasks = await prisma.task.findMany({
      where: { projectId: Number(projectId) },
    });

    // Delete all related records for each task
    for (const task of tasks) {
      await prisma.comment.deleteMany({
        where: { taskId: task.id },
      });
      await prisma.attachment.deleteMany({
        where: { taskId: task.id },
      });
      await prisma.taskAssignment.deleteMany({
        where: { taskId: task.id },
      });
    }

    // Delete all tasks
    await prisma.task.deleteMany({
      where: { projectId: Number(projectId) },
    });

    // Delete project teams
    await prisma.projectTeam.deleteMany({
      where: { projectId: Number(projectId) },
    });

    // Delete the project
    await prisma.project.delete({
      where: {
        id: Number(projectId),
      },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error deleting project: ${error.message}` });
  }
};
