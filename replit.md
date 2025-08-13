# VinScraper Pro

## Overview

VinScraper Pro is a web application that automates the process of scraping vehicle data from automotive dealership websites and generating Facebook Marketplace listings. The system combines a React-based web dashboard with a Chrome extension for web scraping, enabling users to collect vehicle inventory data from sites like AutoTrader, Cars.com, and CarGurus, then manage and post that data to Facebook groups.

The application serves as a comprehensive solution for automotive dealers and resellers who need to efficiently transfer vehicle listings between platforms, providing data validation, inventory management, and automated posting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 13, 2025)

✓ **Fixed Chrome Extension JavaScript Injection Error**: Resolved "Identifier 'isScrapingActive' has already been declared" error by implementing proper injection guards in content.js
✓ **Resolved All TypeScript Compilation Errors**: Fixed 32+ TypeScript errors across chrome-storage.ts, scraper.ts, and storage.ts files
✓ **Updated Chrome Extension Icons**: Properly configured user-provided icon assets (16px, 32px, 48px, 128px)
✓ **Enhanced Extension Script Management**: Improved background script to prevent duplicate content script injections
✓ **Created Complete Setup Guide**: Added SETUP.md with detailed instructions for server and Chrome extension installation
✓ **Completed Migration to Standard Replit Environment**: Successfully migrated project from Replit Agent to standard Replit with proper client-server separation, secure configuration, and full functionality verification
✓ **Configured Production Deployment**: Updated deployment configuration to use proper production build and start commands. The application now correctly builds optimized bundles and serves static assets in production mode

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript and modern web technologies:
- **React with Vite**: Fast development and build tooling with hot module replacement
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for consistent, accessible interface components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
The server follows a REST API pattern built on Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **Storage Layer**: Abstracted storage interface supporting both in-memory storage (development) and PostgreSQL (production)
- **API Design**: RESTful endpoints for vehicles, Facebook groups, posts, and scraping logs
- **Data Validation**: Zod schemas for request/response validation
- **Development**: Integrated Vite development server for seamless full-stack development

### Chrome Extension Integration
The system includes a Chrome extension for web scraping functionality:
- **Content Scripts**: Site-specific scrapers for major automotive websites (AutoTrader, Cars.com, CarGurus, etc.)
- **Background Service Worker**: Manages scraping state and communication between web app and content scripts
- **Popup Interface**: Extension UI for controlling scraping operations and viewing status
- **Cross-Origin Communication**: Secure messaging between extension and web application

### Data Storage Solutions
**Database Schema**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Vehicles Table**: Stores scraped vehicle data including VIN, specifications, pricing, and source information
- **Facebook Groups Table**: Manages target posting groups with activity tracking
- **Facebook Posts Table**: Tracks posting history and status for each vehicle/group combination
- **Scraping Logs Table**: Maintains audit trail of scraping operations and success rates

**Storage Abstraction**: Interface-based storage layer allows switching between in-memory storage (development/testing) and PostgreSQL (production) without changing business logic.

### Authentication and Authorization
Currently implements a simplified security model suitable for single-user or small team deployments. The system is designed to be extended with proper authentication as needed.

### Data Validation and Processing
**VIN Validation**: Client-side VIN validation including check digit verification to ensure data quality
**Schema Validation**: Comprehensive Zod schemas for all data structures ensure type safety and data integrity across the application
**Image Processing**: Handles vehicle image URLs with support for multiple images per vehicle

### Performance Optimizations
**Query Optimization**: TanStack Query provides intelligent caching and background refetching
**Code Splitting**: Vite handles automatic code splitting for optimal bundle sizes
**Responsive Design**: Mobile-first approach with Tailwind CSS for cross-device compatibility

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect support
- **TanStack React Query**: Server state management with caching and synchronization

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built component library based on Radix UI with consistent styling

### Development Tools
- **Vite**: Fast build tool and development server with TypeScript support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for Node.js development server

### Chrome Extension APIs
- **Chrome Storage API**: Persistent storage for extension preferences and scraped data
- **Chrome Tabs API**: Tab management and communication with content scripts
- **Chrome Runtime API**: Message passing between extension components

### Facebook Integration
The system is designed to integrate with Facebook's platform for posting to groups, though specific Facebook APIs are not yet implemented in the current codebase.

### Third-Party Services
**Neon Database**: Cloud PostgreSQL service for production database hosting
**Replit**: Development and deployment platform with integrated tooling

## Development Environment Setup

### Replit Environment (Recommended)
The project is fully configured for Replit development:
- All dependencies are pre-installed and configured
- The "Start application" workflow runs `npm run dev` automatically
- Development server runs on port 5000 with hot module replacement
- All environment variables and build tools are properly configured

### Local Development (Windows/Other Platforms)
For local development outside of Replit:
1. Install Node.js 20+ and npm
2. Run `npm install` to install dependencies
3. For Windows: Use `npm run dev` (the NODE_ENV prefix is handled automatically)
4. For Unix-like systems: `NODE_ENV=development npm run dev` works as expected
5. Access the application at `http://localhost:5000`

## Production Deployment

### Deployment Configuration
The project is properly configured for production deployment on Replit:

**Build Process**: `npm run build`
- Uses Vite to build optimized frontend assets to `dist/public/`
- Uses ESBuild to bundle the server code to `dist/index.js`
- Generates production-ready static assets with compression and optimization

**Production Start**: `npm run start`
- Sets `NODE_ENV=production` for optimal performance
- Serves static files instead of using Vite development server
- Runs the compiled server bundle for better performance

**Environment Detection**: The server automatically detects the environment:
- **Development**: Uses Vite middleware for hot module replacement
- **Production**: Serves pre-built static assets from `dist/public/`

### Deployment Commands
- **Build Command**: `npm run build` - Creates optimized production bundles
- **Start Command**: `npm run start` - Runs the production server
- **Development Command**: `npm run dev` - Runs development server with HMR (not used in deployment)

The deployment configuration in `.replit` correctly specifies these commands for production deployment.