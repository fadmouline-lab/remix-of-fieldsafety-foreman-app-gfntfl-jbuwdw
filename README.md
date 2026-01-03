
# FieldSafety Pro – Foreman App

A React Native + Expo 54 mobile application for construction site safety management and daily operations.

<!-- This project includes workflows for incident reporting, pre-task planning, time cards, activity logs, and hauling dumpsters, all connected to Supabase for data management. -->

## Features

- **Daily Pre-Task Planning**: Create and manage pre-task checklists with hazard identification and mitigation strategies
- **Time Cards**: Track employee hours and attendance
- **Activity Logs**: Document daily site activities with photos, voice memos, and safety observations
- **Incident Reporting**: Comprehensive 5-page workflow for documenting workplace incidents and injuries
- **Hauling Dumpsters**: Request and track dumpster services
- **Equipment Inspection**: Perform and log equipment safety inspections
- **Extra Work Tickets**: Document and request approval for additional work
- **Near Miss & Observation Reports**: Proactive safety reporting tools

## Tech Stack

- React Native + Expo 54
- Expo Router (file-based routing)
- Supabase (backend, database, authentication, storage)
- TypeScript
- React Context API for state management

## Project Structure

- `app/` - Main application screens and routing
- `components/` - Reusable UI components
- `contexts/` - React Context providers for global state
- `lib/` - Supabase client and utilities
- `styles/` - Common styles and theme configuration
- `supabase/functions/` - Supabase Edge Functions

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Scan the QR code with Expo Go app (iOS/Android) or press `w` for web

## Authentication

The app uses Supabase authentication with email/password login. Users must be assigned to an organization and have an employee record to access the app.

## Database

The app connects to a Supabase PostgreSQL database with the following main tables:
- `employees` - Employee records
- `projects` - Construction projects
- `submitted_ptps` - Pre-task planning submissions
- `time_cards` - Time card submissions
- `activity_logs` - Daily activity log entries
- `hauling_requests` - Dumpster hauling requests
- `incident_reports` - Incident and injury reports
- `equipment` - Equipment and materials inventory
- `subcontractors` - Subcontractor companies

All tables implement Row Level Security (RLS) policies for data protection.
