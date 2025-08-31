# Netlify Deployment Guide for Notes Bro

This app has been converted to work with Netlify's serverless architecture.

## What was changed:

### Backend
- Converted Express.js routes to Netlify Functions
- Replaced session-based auth with JWT tokens
- Updated database connection for serverless environment
- Created individual functions for each API endpoint:
  - `auth-login.ts` - User authentication
  - `auth-logout.ts` - User logout
  - `notes.ts` - CRUD operations for notes
  - `notes-detail.ts` - Individual note operations

### Frontend
- Updated API client to use JWT Bearer tokens
- Created authentication utilities for token management
- Modified admin panel to work with stateless authentication
- Updated build configuration for static hosting

### Configuration
- `netlify.toml` - Build and redirect configuration
- `_redirects` and `_headers` - Deployment configuration files

## Deployment Steps:

1. **Connect to Netlify**
   - Connect your GitHub repository to Netlify
   - Or drag and drop the `dist/public` folder to Netlify

2. **Environment Variables**
   Set these in Netlify's environment settings:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens (optional, has default)

3. **Database Setup**
   - Ensure your PostgreSQL database is accessible from the internet
   - Run `npm run db:push` to create the tables

4. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

## Default Login:
- Username: admin
- Password: admin123

The app will automatically create this admin user on first login attempt.