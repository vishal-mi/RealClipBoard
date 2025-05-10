# Supabase Setup for Quick Clipboard

This document explains how to set up Supabase for the Quick Clipboard application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project and set a secure database password
4. Choose a region closest to your users
5. Wait for your database to be provisioned

## 2. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Create a new query 
3. Copy and paste the contents of `schema.sql` into the SQL editor
4. Run the query to create the tables and functions

## 3. Get API Keys

1. In your Supabase dashboard, go to Project Settings > API
2. Copy the URL and the anon/public key
3. Update your `.env.local` file with these values:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Database Structure

### Table: `clips`
- `id` (uuid, primary key): Unique identifier for each clip
- `name` (text, not null): Name of the clip (should be unique)
- `user_id` (uuid, nullable): For future user authentication
- `created_at` (timestamp with time zone): When the clip was created
- `updated_at` (timestamp with time zone): When the clip was last updated

### Table: `clip_items`
- `id` (uuid, primary key): Unique identifier for each clip item
- `clip_id` (uuid, foreign key to clips.id): Reference to the parent clip
- `position` (integer, not null): Position of the item in the clip (1-20)
- `content` (text): The actual text content of the clip item
- `created_at` (timestamp with time zone): When the item was created
- `updated_at` (timestamp with time zone): When the item was last updated

## 5. Future Enhancements

- User authentication
- Sharing clips between users
- Versioning of clips
- Tags and categories for clips