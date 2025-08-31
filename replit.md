# Overview

Notes Bro is a modern educational platform built as a full-stack web application for sharing and managing study notes. The platform serves as a comprehensive repository where students can access various types of educational materials including premium notes, one-pagers, animated content, and typed notes across different classes and subjects. The application features a clean, responsive interface with search functionality and an admin panel for content management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript, utilizing a component-based architecture for maintainability and reusability. The application uses Vite as the build tool for fast development and optimized production builds. State management is handled through React Query (TanStack Query) for server state management, providing caching, synchronization, and background updates. The UI is built with shadcn/ui components based on Radix UI primitives, styled with Tailwind CSS for consistent design and responsive layouts.

## Backend Architecture
The server is built on Express.js with TypeScript, following a modular route-based architecture. The application uses an in-memory storage implementation (MemStorage) as the primary data layer, which can be easily swapped for database implementations. The server includes middleware for request logging, JSON parsing, and error handling. API routes are organized by functionality (auth, notes) with proper validation using Zod schemas.

## Data Storage Solutions
The application currently uses an in-memory storage system for development and testing purposes. The data models are defined using Drizzle ORM schemas with PostgreSQL as the target database dialect. The schema includes tables for users (with role-based authentication) and notes (with metadata like class, subject, and note type). Database migrations are managed through Drizzle Kit for schema evolution.

## Authentication and Authorization
The application implements a simple session-based authentication system with role-based access control. Users can have either "student" or "admin" roles, with admin users having access to the management panel for creating, editing, and deleting notes. The authentication flow includes login validation using Zod schemas and basic credential verification.

## Component Structure
The frontend follows a well-organized component hierarchy with reusable UI components, feature-specific components (admin panel, notes search), and page components. The application uses Wouter for client-side routing, providing a lightweight navigation solution. Components are structured with proper separation of concerns, utilizing custom hooks for state management and API interactions.

# External Dependencies

- **Neon Database**: PostgreSQL hosting service configured via connection string
- **Google Drive**: External storage for note files accessed through drive links
- **Radix UI**: Headless UI component library for accessible interface elements
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Drizzle ORM**: Type-safe SQL toolkit for database operations and schema management
- **React Query (TanStack)**: Server state management and caching solution
- **Zod**: Runtime type validation for API request/response validation
- **Vite**: Modern build tool for development server and production bundling
- **Express.js**: Web application framework for the backend API server