"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, Trash2, Edit2, GripVertical, List, ChevronDown } from 'lucide-react';
import { Header } from "@/components/header"

// Default military task list template
const DEFAULT_TASKS = [
  { id: 'default-1', title: 'Update SGLI beneficiary information', completed: false },
  { id: 'default-2', title: 'Complete security clearance paperwork', completed: false },
  { id: 'default-3', title: 'Set up military email and communication', completed: false },
  { id: 'default-4', title: 'Review deployment checklist', completed: false },
  { id: 'default-5', title: 'Attend mandatory training sessions', completed: false },
  { id: 'default-6', title: 'Update emergency contact information', completed: false },
  { id: 'default-7', title: 'Complete annual health assessment', completed: false },
  { id: 'default-8', title: 'Review and sign UCMJ acknowledgment', completed: false },
  { id: 'default-9', title: 'Set up direct deposit for pay', completed: false },
  { id: 'default-10', title: 'Complete initial gear issue', completed: false },
  { id: 'default-11', title: 'Enroll in Tricare health benefits', completed: false },
  { id: 'default-12', title: 'Create a family care plan (if applicable)', completed: false },
];

export default function MilitaryTasksPage() {
  const [taskLists, setTaskLists] = useState([
    {
      id: 'general',
      title: 'General',
      tasks: DEFAULT_TASKS.map(t => ({ ...t, position: DEFAULT_TASKS.indexOf(t) }))
    }
  ]);
  const [activeListId, setActiveListId] = useState('general');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverTask, setDraggedOverTask] = useState(null);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const editInputRef = useRef(null);
  const listEditInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Simulated auth check - replace with actual Supabase auth
  useEffect(() => {
    // Check if user is authenticated
    // const { data: { user } } = await supabase.auth.getUser()
    // setIsAuthenticated(!!user)
    
    // For now, simulate unauthenticated state
    setIsAuthenticated(false);
  }, []);

  // Load tasks from Supabase if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Load user's task lists from Supabase
      // const { data: lists } = await supabase
      //   .from('task_lists')
      //   .select('*, tasks(*)')
      //   .order('position')
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowListDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  useEffect(() => {
    if (editingListId && listEditInputRef.current) {
      listEditInputRef.current.focus();
      listEditInputRef.current.select();
    }
  }, [editingListId]);

  const activeList = taskLists.find(list => list.id === activeListId);
  const sortedTasks = activeList ? [...activeList.tasks].sort((a, b) => a.position - b.position) : [];
  const completedTasks = sortedTasks.filter(t => t.completed);
  const incompleteTasks = sortedTasks.filter(t => !t.completed);

  const updateTaskList = (listId, updates) => {
    setTaskLists(prev => prev.map(list => 
      list.id === listId ? { ...list, ...updates } : list
    ));
    
    if (isAuthenticated) {
      // Update in Supabase
      // await supabase.from('task_lists').update(updates).eq('id', listId)
    }
  };

  const updateTask = (taskId, updates) => {
    setTaskLists(prev => prev.map(list => 
      list.id === activeListId
        ? {
            ...list,
            tasks: list.tasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : list
    ));

    if (isAuthenticated) {
      // Update in Supabase
      // await supabase.from('tasks').update(updates).eq('id', taskId)
    }
  };

  const toggleTask = (taskId) => {
    const task = activeList.tasks.find(t => t.id === taskId);
    updateTask(taskId, { completed: !task.completed });
  };

  const addTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      completed: false,
      position: activeList.tasks.length
    };
    
    updateTaskList(activeListId, {
      tasks: [...activeList.tasks, newTask]
    });
    
    setEditingTaskId(newTask.id);
  };

  const deleteTask = (taskId) => {
    updateTaskList(activeListId, {
      tasks: activeList.tasks.filter(t => t.id !== taskId)
    });

    if (isAuthenticated) {
      // Delete from Supabase
      // await supabase.from('tasks').delete().eq('id', taskId)
    }
  };

  const saveTaskEdit = (taskId, newTitle) => {
    if (newTitle.trim()) {
      updateTask(taskId, { title: newTitle.trim() });
    }
    setEditingTaskId(null);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    if (draggedTask && draggedTask.id !== task.id) {
      setDraggedOverTask(task);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedOverTask) return;

    const tasks = [...activeList.tasks];
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex(t => t.id === draggedOverTask.id);

    // Remove dragged task
    tasks.splice(draggedIndex, 1);
    // Insert at new position
    tasks.splice(targetIndex, 0, draggedTask);

    // Update positions
    const updatedTasks = tasks.map((task, index) => ({ ...task, position: index }));
    
    updateTaskList(activeListId, { tasks: updatedTasks });
    
    setDraggedTask(null);
    setDraggedOverTask(null);
  };

  const addTaskList = () => {
    const newList = {
      id: `list-${Date.now()}`,
      title: 'New List',
      tasks: []
    };
    
    setTaskLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    setEditingListId(newList.id);

    if (isAuthenticated) {
      // Insert into Supabase
      // await supabase.from('task_lists').insert({ title: 'New List', position: taskLists.length })
    }
  };

  const deleteTaskList = (listId) => {
    if (taskLists.length <= 1) return; // Keep at least one list
    
    setTaskLists(prev => prev.filter(list => list.id !== listId));
    
    if (activeListId === listId) {
      setActiveListId(taskLists[0].id === listId ? taskLists[1].id : taskLists[0].id);
    }

    if (isAuthenticated) {
      // Delete from Supabase (cascade will delete tasks)
      // await supabase.from('task_lists').delete().eq('id', listId)
    }
  };

  const saveListEdit = (listId, newTitle) => {
    if (newTitle.trim()) {
      updateTaskList(listId, { title: newTitle.trim() });
    }
    setEditingListId(null);
  };

  return (
    //<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="min-h-screen bg-background">
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: '30px 30px'
           }} 
      />
      <Header/>
      
      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-950 to-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
              <List className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-950 via-amber-400 to-blue-950 bg-clip-text text-transparent"
                style={{ fontFamily: "'Oswald', sans-serif" }}>
              MISSION TRACKER
            </h1>
          </div>
          <p className="text-slate-600 text-lg tracking-wide" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Your personal command center for military readiness
          </p>
        </header>

        {/* Task List Selector */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-6 py-4 flex items-center justify-between hover:bg-slate-800/70 hover:border-amber-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                {editingListId === activeListId ? (
                  <input
                    ref={listEditInputRef}
                    type="text"
                    defaultValue={activeList.title}
                    onBlur={(e) => saveListEdit(activeListId, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveListEdit(activeListId, e.target.value);
                      if (e.key === 'Escape') setEditingListId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900/50 border border-amber-500/30 rounded-lg px-3 py-1 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  />
                ) : (
                  <>
                    <span className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {activeList?.title || 'Select List'}
                    </span>
                    <span className="text-sm text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                      {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!editingListId && activeListId !== 'general' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingListId(activeListId);
                    }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showListDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showListDropdown && (
              <div className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-64 overflow-y-auto">
                  {taskLists.map((list) => (
                    <div
                      key={list.id}
                      onClick={() => {
                        setActiveListId(list.id);
                        setShowListDropdown(false);
                      }}
                      className={`px-6 py-3 cursor-pointer flex items-center justify-between group hover:bg-slate-700/50 transition-colors ${
                        list.id === activeListId ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''
                      }`}
                    >
                      <span className="font-semibold text-white" style={{ fontFamily: "'Barlow', sans-serif" }}>
                        {list.title}
                      </span>
                      {list.id !== 'general' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTaskList(list.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    addTaskList();
                    setShowListDropdown(false);
                  }}
                  className="w-full px-6 py-3 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-colors group"
                >
                  <Plus className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-amber-500" style={{ fontFamily: "'Barlow', sans-serif" }}>
                    Create New List
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Stats Bar */}
          <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-slate-700/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  {incompleteTasks.length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-semibold text-slate-300" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  {completedTasks.length} Complete
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {completedTasks.length > 0 && (
                  <span>{Math.round((completedTasks.length / sortedTasks.length) * 100)}% Done</span>
                )}
              </div>
            </div>
            
            <button
              onClick={addTask}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-950 to-amber-400 hover:from-amber-400 hover:to-amber-400 text-slate-900 font-bold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              <Plus className="w-4 h-4" />
              ADD TASK
            </button>
          </div>

          {/* Tasks Container */}
          <div className="divide-y divide-slate-700/30">
            {/* Incomplete Tasks */}
            {incompleteTasks.map((task) => (
              <div
                key={task.id}
                draggable={!editingTaskId}
                onDragStart={() => handleDragStart(task)}
                onDragOver={(e) => handleDragOver(e, task)}
                onDrop={handleDrop}
                onDragEnd={() => {
                  setDraggedTask(null);
                  setDraggedOverTask(null);
                }}
                className={`group px-6 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-all duration-200 ${
                  draggedOverTask?.id === task.id ? 'bg-amber-500/5 border-l-4 border-amber-500' : ''
                } ${draggedTask?.id === task.id ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-5 h-5 text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-md border-2 border-slate-600 hover:border-amber-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group/check"
                >
                  <div className="w-0 h-0 opacity-0 group-hover/check:w-4 group-hover/check:h-4 group-hover/check:opacity-100 bg-amber-500/20 rounded transition-all duration-300" />
                </button>

                {editingTaskId === task.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    defaultValue={task.title}
                    onBlur={(e) => saveTaskEdit(task.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTaskEdit(task.id, e.target.value);
                      if (e.key === 'Escape') setEditingTaskId(null);
                    }}
                    className="flex-1 bg-slate-900/50 border border-amber-500/30 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500/50"
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  />
                ) : (
                  <span
                    onClick={() => setEditingTaskId(task.id)}
                    className="flex-1 text-white font-medium cursor-text hover:text-amber-500 transition-colors"
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  >
                    {task.title}
                  </span>
                )}

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingTaskId(task.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-slate-900/30">
                <div className="px-6 py-3 border-t-2 border-slate-700/50">
                  <h3 className="text-sm font-bold text-green-500 tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    ✓ COMPLETED ({completedTasks.length})
                  </h3>
                </div>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group px-6 py-3 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <GripVertical className="w-5 h-5 text-slate-700 opacity-0" />
                    
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-transform duration-300"
                    >
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </button>

                    <span
                      className="flex-1 text-slate-400 font-medium line-through"
                      style={{ fontFamily: "'Barlow', sans-serif" }}
                    >
                      {task.title}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {sortedTasks.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="w-20 h-20 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <List className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  NO TASKS YET
                </h3>
                <p className="text-slate-500" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  Add your first task to get started on your mission
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Auth Notice */}
        {!isAuthenticated && (
          <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl px-6 py-4 backdrop-blur-sm">
            <p className="text-amber-500 text-sm text-center" style={{ fontFamily: "'Barlow', sans-serif" }}>
              <strong className="font-bold">Note:</strong> You're not logged in. Your tasks will reset when you refresh the page. Sign in to save your progress.
            </p>
          </div>
        )}
      </div>

      {/* Google Fonts Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Barlow:wght@400;600;700&display=swap');
        
        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-8px);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
      `}</style>
    </div>
  );
}
