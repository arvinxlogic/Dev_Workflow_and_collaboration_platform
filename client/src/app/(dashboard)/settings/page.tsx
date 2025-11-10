"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";
import { User, Bell, Palette, Camera, Loader2, Check, X } from "lucide-react";
import api from "@/lib/axios";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    age: '',
    bio: ''
  });

  // Load user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfile({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || '',
        age: data.age?.toString() || '',
        bio: data.bio || ''
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      showMessage('error', 'Failed to load profile');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.put('/users/profile', {
        name: profile.name,
        avatar: profile.avatar,
        age: profile.age ? parseInt(profile.age) : undefined,
        bio: profile.bio
      });

      // Update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          name: data.name,
          avatar: data.avatar
        }));
      }

      showMessage('success', 'Profile updated successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar URL input
  const handleAvatarChange = (url: string) => {
    setProfile({ ...profile, avatar: url });
  };

  // ❌ REMOVED: Security tab from tabs array
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Success/Error Message */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              
              {/* ✅ PROFILE TAB */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate}>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Profile Settings
                  </h2>

                  {/* Avatar Section */}
                  <div className="mb-6 flex items-center gap-6">
                    <div className="relative">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover border-4 border-blue-500"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-500">
                          {profile.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 cursor-pointer hover:bg-blue-700">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={profile.avatar}
                        onChange={(e) => handleAvatarChange(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Enter image URL or use services like Gravatar, UI Avatars
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 cursor-not-allowed dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Age
                      </label>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        min="13"
                        max="120"
                        placeholder="Enter your age"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        maxLength={500}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {profile.bio.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* ✅ APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Appearance Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Toggle dark mode on or off
                        </p>
                      </div>
                      <button
                        onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Notification Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "Email notifications", desc: "Receive email notifications for updates" },
                      { label: "Push notifications", desc: "Receive push notifications in browser" },
                      { label: "Task assignments", desc: "Get notified when assigned to tasks" },
                      { label: "Project mentions", desc: "Get notified when mentioned in projects" },
                      { label: "Deadline reminders", desc: "Receive reminders for upcoming deadlines" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ❌ REMOVED: Security tab section */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
