// lib/supabase-tasks.js
// Utility functions for integrating tasks with Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Fetch all task lists for the current user
 */
export async function fetchTaskLists(userId) {
  const { data, error } = await supabase
    .from('task_lists')
    .select(`
      id,
      title,
      position,
      created_at,
      tasks (
        id,
        title,
        description,
        completed,
        position,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching task lists:', error);
    return { data: null, error };
  }

  // Sort tasks within each list
  const listsWithSortedTasks = data.map(list => ({
    ...list,
    tasks: list.tasks.sort((a, b) => a.position - b.position)
  }));

  return { data: listsWithSortedTasks, error: null };
}

/**
 * Create a new task list
 */
export async function createTaskList(userId, title) {
  // Get current max position
  const { data: existingLists } = await supabase
    .from('task_lists')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = existingLists?.[0]?.position ?? -1;

  const { data, error } = await supabase
    .from('task_lists')
    .insert({
      user_id: userId,
      title,
      position: maxPosition + 1
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a task list
 */
export async function updateTaskList(listId, updates) {
  const { data, error } = await supabase
    .from('task_lists')
    .update(updates)
    .eq('id', listId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a task list (and all its tasks via cascade)
 */
export async function deleteTaskList(listId) {
  const { error } = await supabase
    .from('task_lists')
    .delete()
    .eq('id', listId);

  return { error };
}

/**
 * Create a new task
 */
export async function createTask(userId, listId, title) {
  // Get current max position in the list
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('list_id', listId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = existingTasks?.[0]?.position ?? -1;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      list_id: listId,
      title,
      position: maxPosition + 1,
      completed: false
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a task
 */
export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  return { error };
}

/**
 * Reorder tasks within a list
 */
export async function reorderTasks(listId, taskIds) {
  // Update positions for all tasks in the list
  const updates = taskIds.map((taskId, index) => ({
    id: taskId,
    position: index
  }));

  const promises = updates.map(({ id, position }) =>
    supabase
      .from('tasks')
      .update({ position })
      .eq('id', id)
      .eq('list_id', listId)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error).map(r => r.error);

  return { error: errors.length > 0 ? errors : null };
}

/**
 * Batch update task positions (more efficient for drag-and-drop)
 */
export async function batchUpdateTaskPositions(taskUpdates) {
  // taskUpdates is an array of { id, position }
  const promises = taskUpdates.map(({ id, position }) =>
    supabase
      .from('tasks')
      .update({ position })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error).map(r => r.error);

  return { error: errors.length > 0 ? errors : null };
}

/**
 * Subscribe to real-time changes for task lists
 */
export function subscribeToTaskLists(userId, callback) {
  const subscription = supabase
    .channel('task_lists_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'task_lists',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to real-time changes for tasks
 */
export function subscribeToTasks(userId, callback) {
  const subscription = supabase
    .channel('tasks_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

/**
 * Initialize default task list for new users
 */
export async function initializeDefaultTaskList(userId) {
  const defaultTasks = [
    'Update SGLI beneficiary information',
    'Complete security clearance paperwork',
    'Set up military email and communication',
    'Review deployment checklist',
    'Attend mandatory training sessions',
    'Update emergency contact information',
    'Complete annual health assessment',
    'Review and sign UCMJ acknowledgment',
    'Set up direct deposit for pay',
    'Complete initial gear issue',
    'Enroll in Tricare health benefits',
    'Create a family care plan (if applicable)'
  ];

  // Create the General list
  const { data: list, error: listError } = await createTaskList(userId, 'General');
  
  if (listError) {
    console.error('Error creating default list:', listError);
    return { error: listError };
  }

  // Create all default tasks
  const taskPromises = defaultTasks.map((title, index) =>
    supabase.from('tasks').insert({
      user_id: userId,
      list_id: list.id,
      title,
      position: index,
      completed: false
    })
  );

  const results = await Promise.all(taskPromises);
  const errors = results.filter(r => r.error).map(r => r.error);

  return { data: list, error: errors.length > 0 ? errors : null };
}
