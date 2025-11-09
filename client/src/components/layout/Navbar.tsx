"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Menu, Moon, Sun, Bell, Search } from "lucide-react";
import React from "react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900 shadow-md">
      {/* Left side */}
      <div className="flex items-center gap-8">
        {isSidebarCollapsed && (
          <button onClick={toggleSidebar} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="h-6 w-6 dark:text-white" />
          </button>
        )}
        
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-gray-700" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-6 w-6 dark:text-white" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Profile */}
        <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          A
        </div>
      </div>
    </div>
  );
};

export default Navbar;
