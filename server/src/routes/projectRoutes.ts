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

    // Delete project
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
