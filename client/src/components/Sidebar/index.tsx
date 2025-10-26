"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetAuthUserQuery, useGetProjectsQuery, useDeleteProjectMutation } from "@/state/api";
import { signOut } from "aws-amplify/auth";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
  Clock,
  PlusSquare,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import ModalNewProject from "@/app/projects/ModalNewProject";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);

  const { data: projects } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const { data: currentUser } = useGetAuthUserQuery({});
  
  const handleDeleteProject = async (projectId: number, projectName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Delete "${projectName}"? This will delete all tasks and data!`)) {
      try {
        await deleteProject(projectId).unwrap();
      } catch (error) {
        alert("Error deleting project");
        console.error(error);
      }
    }
  };

  if (!currentUser) return null;
  const currentUserDetails = currentUser?.userDetails;

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}`;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* Top Logo */}
        <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            ARVIND TEAM
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
            >
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            </button>
          )}
        </div>

        {/* Team Section */}
        <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <div>
            <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
              ARVIND TEAM
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500">Private</p>
            </div>
          </div>
        </div>

        {/* Navbar Links */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/home" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users} label="Teams" href="/teams" />
        </nav>

        {/* Projects Section */}
        <div className="px-8 py-4">
          <div className="flex w-full items-center justify-between">
            <button
              onClick={() => setShowProjects((prev) => !prev)}
              className="flex-1 text-left text-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              Projects
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
              onClick={() => setIsModalNewProjectOpen(true)}
            >
              <PlusSquare className="h-4 w-4 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={() => setShowProjects((prev) => !prev)}
              className="ml-2"
            >
              {showProjects ? (
                <ChevronUp className="h-5 w-5 text-gray-800 dark:text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-800 dark:text-white" />
              )}
            </button>
          </div>
          {showProjects &&
            projects?.map((project) => (
              <ProjectLink
                key={project.id}
                projectId={project.id}
                projectName={project.name}
                onDelete={handleDeleteProject}
              />
            ))}
        </div>

        {/* Priority Section */}
        <div className="px-8 py-4">
          <button
            onClick={() => setShowPriority((prev) => !prev)}
            className="flex w-full items-center justify-between text-lg font-semibold text-gray-800 dark:text-gray-200"
          >
            <span>Priority</span>
            {showPriority ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {showPriority && (
            <>
              <SidebarLink
                icon={AlertOctagon}
                label="Urgent"
                href="/priority/urgent"
              />
              <SidebarLink
                icon={ShieldAlert}
                label="High"
                href="/priority/high"
              />
              <SidebarLink
                icon={AlertTriangle}
                label="Medium"
                href="/priority/medium"
              />
              <SidebarLink
                icon={AlertCircle}
                label="Low"
                href="/priority/low"
              />
              <SidebarLink icon={Clock} label="Backlog" href="/priority/backlog" />
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
      />
    </div>
  );
};

interface ProjectLinkProps {
  projectId: number;
  projectName: string;
  onDelete: (projectId: number, projectName: string, e: React.MouseEvent) => void;
}

const ProjectLink = ({ projectId, projectName, onDelete }: ProjectLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === `/projects/${projectId}`;
  const [showDelete, setShowDelete] = useState(false);

  return (
    <Link href={`/projects/${projectId}`} className="w-full">
      <div
        className={`group relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-between px-8 py-3`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />
        )}

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Briefcase className="h-6 w-6 text-gray-800 dark:text-gray-100 flex-shrink-0" />
          <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
            {projectName}
          </span>
        </div>
        
        {showDelete && (
          <button
            onClick={(e) => onDelete(projectId, projectName, e)}
            className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500" />
          </button>
        )}
      </div>
    </Link>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />
        )}

        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <span className={`font-medium text-gray-800 dark:text-gray-100`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default Sidebar;
