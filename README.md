
# FieldSafety Pro – Foreman App

A React Native + Expo mobile application for construction site safety management and daily operations.

## Features

- Daily Pre-Task Checklists
- Time-Card Management
- Daily Activity Logs
- Hauling Dumpsters Workflow
- Extra Work Tickets
- Equipment Inspection
- Safety Reporting (Observation, Near Miss, Incident)

## Tech Stack

- React Native
- Expo 54
- Supabase (Backend & Auth)
- TypeScript

<!-- This app helps foremen manage job-site safety and operations efficiently -->

<!-- Built with Expo Router for file-based navigation and Supabase for real-time data sync -->

<!-- 
  DEVELOPER NOTES:
  - Recent improvements include fixing the infinite loading state on hauling dumpster submissions
  - The hauling workflow uses a multi-step form pattern with proper loading state management
  - All form submissions now use try/catch/finally to ensure loading states are properly reset
  - Backend integration uses Supabase Edge Functions for secure data handling
  - Employee and organization context is derived from authenticated user tokens for security
-->
