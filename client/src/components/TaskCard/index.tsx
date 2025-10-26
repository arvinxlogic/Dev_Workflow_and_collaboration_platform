import { Task, useGetTaskCommentsQuery, useCreateCommentMutation, useGetAuthUserQuery } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React, { useState } from "react";
import { Calendar, User, Tag, AlertCircle, MessageCircle, Send } from "lucide-react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const { data: comments, isLoading: commentsLoading } = useGetTaskCommentsQuery(task.id);
  const { data: currentUser } = useGetAuthUserQuery({});
  const [createComment, { isLoading: creating }] = useCreateCommentMutation();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser?.userDetails?.userId) return;

    try {
      await createComment({
        text: newComment,
        taskId: task.id,
        userId: currentUser.userDetails.userId,
      }).unwrap();
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to post comment");
    }
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case "Urgent":
        return "badge-urgent";
      case "High":
        return "badge-high";
      case "Medium":
        return "badge-medium";
      case "Low":
        return "badge-low";
      default:
        return "badge-backlog";
    }
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case "Completed":
        return "bg-success-light text-success-dark dark:bg-success-dark/20 dark:text-success";
      case "Work In Progress":
        return "bg-info-light text-info-dark dark:bg-info-dark/20 dark:text-info";
      case "Under Review":
        return "bg-warning-light text-warning-dark dark:bg-warning-dark/20 dark:text-warning";
      default:
        return "bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-200";
    }
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              #{task.id}
            </span>
            <span className={`badge ${getPriorityStyles(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <h3 className="text-base font-bold text-secondary-900 dark:text-white mb-1">
            {task.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Status */}
      <div className="mb-4">
        <span className={`badge ${getStatusStyles(task.status)}`}>
          {task.status || "To Do"}
        </span>
      </div>

      {/* Tags */}
      {task.tags && (
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-secondary-500" />
          <span className="text-xs text-secondary-600 dark:text-secondary-400">
            {task.tags}
          </span>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-secondary-200 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-secondary-500" />
          <div>
            <p className="text-xs text-secondary-500 dark:text-secondary-500">
              Start
            </p>
            <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
              {task.startDate ? format(new Date(task.startDate), "MMM dd") : "Not set"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-secondary-500" />
          <div>
            <p className="text-xs text-secondary-500 dark:text-secondary-500">
              Due
            </p>
            <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
              {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-secondary-500" />
          <div>
            <p className="text-xs text-secondary-500">Author</p>
            <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
              {task.author?.username || "Unknown"}
            </p>
          </div>
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2">
            {task.assignee.profilePictureUrl ? (
              <Image
                src={`/${task.assignee.profilePictureUrl}`}
                alt={task.assignee.username}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-secondary-200 dark:ring-dark-border"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 ring-2 ring-secondary-200 dark:ring-dark-border">
                <span className="text-xs font-semibold text-white">
                  {task.assignee.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t border-secondary-200 dark:border-dark-border pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-3"
        >
          <MessageCircle className="h-4 w-4" />
          {comments?.length || 0} Comments
        </button>

        {showComments && (
          <div className="space-y-3">
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-field text-sm flex-1"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || creating}
                className="btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {commentsLoading && (
                <p className="text-xs text-secondary-500">Loading comments...</p>
              )}
              {comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-secondary-50 dark:bg-dark-tertiary rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-semibold flex-shrink-0">
                      {comment.user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-secondary-900 dark:text-white">
                        {comment.user?.username || "Unknown User"}
                      </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
