# Military Tasks Page - Setup & Integration Guide

A feature-rich, military-themed task management page built with React and designed for integration with Supabase.

## Features

✅ **Task Management**
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Drag-and-drop to reorder tasks
- Visual distinction between active and completed tasks

✅ **Multiple Task Lists**
- Create and manage multiple task lists
- Switch between lists easily
- Edit list names
- Delete lists (except default "General" list)

✅ **Default Military Tasks**
- Pre-populated with common military administrative tasks
- Perfect for service members during boot camp, deployment, or training

✅ **Modern Design**
- Military-inspired aesthetic with amber/orange accent colors
- Smooth animations and micro-interactions
- Responsive layout
- Distinctive typography (Oswald + Barlow fonts)

✅ **Local & Cloud Storage**
- Works offline (local state) when not authenticated
- Syncs with Supabase when user is logged in
- Real-time updates (when enabled)

## Files Included

1. **supabase-schema.sql** - Database schema for Supabase
2. **supabase-tasks-utils.js** - Helper functions for Supabase integration
3. **tasks-page.jsx** - Standalone page (no backend integration)
4. **tasks-page-with-supabase.jsx** - Production-ready page with Supabase integration hooks

## Quick Start

### Option 1: Use Without Backend (Testing/Demo)

Simply use `tasks-page.jsx`:

```jsx
import MilitaryTasksPage from './tasks-page';

function App() {
  return <MilitaryTasksPage />;
}
```

Tasks will persist in component state but reset on page refresh.

### Option 2: Integrate with Supabase

Follow these steps to get full backend integration:

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script

This will create:
- `task_lists` table
- `tasks` table
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for timestamp updates

### Step 3: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 5: Add Supabase Utilities

1. Create a `lib` folder in your project
2. Copy `supabase-tasks-utils.js` to `lib/supabase-tasks.js`
3. The file exports all the functions you need for task management

### Step 6: Integrate the Page

1. Copy `tasks-page-with-supabase.jsx` to your project
2. Uncomment the import at the top:

```jsx
import {
  getCurrentUser,
  fetchTaskLists,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  createTask,
  updateTask,
  deleteTask,
  batchUpdateTaskPositions,
  subscribeToTaskLists,
  subscribeToTasks,
  initializeDefaultTaskList
} from '@/lib/supabase-tasks';
```

3. Follow the **INTEGRATION STEPS** comments in the file (there are 11 steps)
4. Each step is clearly marked with a comment like:
   ```jsx
   // INTEGRATION STEP 1: Uncomment to enable auth checking
   ```

### Step 7: Set Up Authentication

The page expects user authentication. You'll need to:

1. Set up Supabase Auth in your app
2. Provide a login/signup flow
3. The page will automatically detect authenticated users

Example auth setup:

```jsx
// In your app's auth context or component
import { supabase } from '@/lib/supabase-tasks';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
await supabase.auth.signOut();
```

## Database Schema Explanation

### task_lists Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | List name |
| position | INTEGER | Sort order |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| list_id | UUID | Foreign key to task_lists |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Task description |
| description | TEXT | Optional details |
| completed | BOOLEAN | Completion status |
| position | INTEGER | Sort order within list |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Create data with their user_id
- Update their own data
- Delete their own data

This ensures complete data isolation between users.

## API Functions Reference

### Authentication

```jsx
getCurrentUser()
// Returns: { user, error }
```

### Task Lists

```jsx
fetchTaskLists(userId)
// Returns: { data: [taskLists], error }

createTaskList(userId, title)
// Returns: { data: taskList, error }

updateTaskList(listId, updates)
// Returns: { data: taskList, error }

deleteTaskList(listId)
// Returns: { error }
```

### Tasks

```jsx
createTask(userId, listId, title)
// Returns: { data: task, error }

updateTask(taskId, updates)
// Returns: { data: task, error }

deleteTask(taskId)
// Returns: { error }

batchUpdateTaskPositions(taskUpdates)
// taskUpdates: [{ id, position }, ...]
// Returns: { error }
```

### Real-time Subscriptions

```jsx
const subscription = subscribeToTaskLists(userId, (payload) => {
  console.log('Change:', payload);
  // Reload data or update UI
});

// Clean up
subscription.unsubscribe();
```

### Initialization

```jsx
initializeDefaultTaskList(userId)
// Creates the "General" list with default military tasks
// Returns: { data: taskList, error }
```

## Customization

### Change Colors

The design uses amber/orange military theme colors. To customize:

```jsx
// Find these classes in the JSX:
bg-gradient-to-br from-amber-400 to-orange-600  // Primary gradient
text-amber-500  // Accent text
border-amber-500  // Accent borders
```

Replace `amber` and `orange` with your preferred Tailwind colors.

### Change Fonts

The page uses:
- **Oswald** (bold, military-style headers)
- **Barlow** (clean, readable body text)

To change fonts, update the Google Fonts import:

```jsx
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap');
`}</style>
```

And update the `fontFamily` styles throughout the JSX.

### Modify Default Tasks

Edit the `DEFAULT_TASKS` array at the top of the component:

```jsx
const DEFAULT_TASKS = [
  { id: 'default-1', title: 'Your custom task', completed: false, position: 0 },
  // Add more tasks...
];
```

## Troubleshooting

### Tasks aren't persisting

**Solution:** Check that:
1. You've uncommented all integration steps
2. Supabase client is properly initialized
3. User is authenticated
4. RLS policies are correctly set up

### Can't delete tasks/lists

**Solution:** Verify:
1. User is logged in
2. RLS policies allow the operation
3. Foreign key constraints are in place
4. You're not trying to delete the last remaining list

### Drag-and-drop not working

**Solution:**
- Ensure `editingTaskId` is null (can't drag while editing)
- Check browser console for errors
- Verify position updates are saving to database

### Real-time updates not working

**Solution:**
1. Enable Realtime in Supabase dashboard (Database > Replication)
2. Check subscription is properly set up
3. Verify user permissions

## Performance Optimization

### Reduce Database Calls

The current implementation makes individual calls per task when reordering. For better performance with large lists:

1. Use `batchUpdateTaskPositions` for drag-and-drop
2. Debounce auto-save operations
3. Consider optimistic updates for better UX

### Caching

Consider adding React Query or SWR for:
- Automatic caching
- Background refetching
- Optimistic updates
- Better error handling

Example with React Query:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { data: taskLists } = useQuery({
  queryKey: ['taskLists', user?.id],
  queryFn: () => fetchTaskLists(user.id),
  enabled: !!user
});
```

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Authentication flow implemented
- [ ] All integration steps uncommented
- [ ] RLS policies tested
- [ ] Real-time subscriptions enabled (optional)
- [ ] Error handling added for production
- [ ] Loading states implemented
- [ ] Tested with multiple users

## Support & Customization

This component is designed to be:
- **Modular** - Easy to extract and reuse parts
- **Customizable** - Clear styling and structure
- **Extensible** - Add features like due dates, priorities, tags, etc.

### Ideas for Extensions

- **Due dates** - Add a date picker and `due_date` column
- **Priorities** - Add priority levels (high, medium, low)
- **Tags/Categories** - Add a tags table and many-to-many relationship
- **Subtasks** - Self-referencing foreign key for nested tasks
- **Attachments** - Integrate Supabase Storage for file uploads
- **Collaboration** - Share lists with other users
- **Templates** - Save and reuse task list templates

## License

This code is provided as-is for use in your projects. Customize and modify as needed!

---

**Built with:** React, Tailwind CSS, Supabase, and attention to military service members' needs.
