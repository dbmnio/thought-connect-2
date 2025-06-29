# ThoughtConnect Project Overview

This document provides a comprehensive overview of the ThoughtConnect application, intended to be used as a reference for AI developers and engineers. Its purpose is to detail the project's architecture, technology stack, and core concepts to facilitate effective and accurate development.

## 1. High-Level Goal

ThoughtConnect is a mobile application designed for students, researchers, and learners. It functions as a "Snapchat for knowledge," allowing users to capture and organize information in the form of "thoughts" (images with descriptions). These thoughts are stored, embedded, and made searchable in a shared knowledge base, which can be queried using an AI-powered chatbot. The core idea is to provide a low-effort way for communities to build and search their collective knowledge.

## 2. Technology Stack

The application is built on a modern React Native stack:

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) for file-system-based navigation.
- **Backend-as-a-Service (BaaS):** [Supabase](https://supabase.io/) for database, authentication, storage, and edge functions.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) for lightweight, hook-based global state.
- **UI:**
  - Core React Native components.
  - **Icons:** A combination of `@expo/vector-icons`, `lucide-react-native`, and `expo-symbols`.
  - **Lists:** `@shopify/flash-list` for performant, memory-efficient lists.
  - **Styling:** Custom styling, likely using StyleSheet, with an emphasis on a clean, modern aesthetic.
- **Camera & Images:** `expo-camera` and `expo-image-picker`.

## 3. Codebase Architecture

### 3.1. File Structure

The project follows a feature-oriented directory structure:

- `_docs/`: Contains project documentation, design plans, and prompts.
- `app/`: The heart of the Expo Router setup. All files and directories here define the app's routes.
- `assets/`: Static assets like images and fonts.
- `components/`: Reusable React components, organized by feature (`knowledge-base`, `team`, `thoughts`) and a `ui/` directory for generic components.
- `hooks/`: Custom React hooks for shared logic (e.g., `useAuth`, `useTeam`).
- `lib/`: Utility functions and third-party library initializations (e.g., `supabase.ts`).
- `supabase/`: Backend code, including database migrations and edge functions.
- `types/`: TypeScript type definitions, including auto-generated Supabase types in `database.ts`.

### 3.2. Routing & Navigation

Navigation is managed by **Expo Router**. The `app/` directory layout dictates the app's routes.

- **Route Groups:**
  - `(auth)`: Contains all screens for the authentication flow (sign-in, sign-up). These have a separate layout without the main app's UI.
  - `(app)`: Contains the core application screens, protected and accessible only after login.
- **App Entry:** `app/index.tsx` acts as a gatekeeper, checking the user's authentication status and redirecting them to either the `(auth)` or `(app)` flow.
- **Core Navigation:** The `(app)` group uses a bottom tab navigator (`app/(app)/_layout.tsx`) to switch between the main features:
  - `knowledge-base.tsx`: The AI chat interface.
  - `camera.tsx`: The default screen for capturing new "thoughts."
  - `thoughts.tsx`: A feed to view and filter existing thoughts.
- **Stack Navigation:** Detail screens (e.g., viewing a specific thought thread in `question-thread/[id].tsx` or editing a photo in `photo-editor.tsx`) are pushed onto the navigation stack.

### 3.3. State Management

Global state is managed with **Zustand**. A key store is `lib/stores/useThoughtStore.ts`, which likely manages the state for thoughts fetched from the database. Context providers in `app/_layout.tsx` (`AuthProvider`, `TeamProvider`) also manage global state related to the user and their selected team.

### 3.4. Backend Integration (Supabase)

Supabase is the all-in-one backend. The client is initialized in `lib/supabase.ts`, using types generated from the database schema for full TypeScript support.

- **Database:** A PostgreSQL database. The schema is managed via migrations in `supabase/migrations/`.
- **Authentication:** Supabase Auth is used for user sign-up and sign-in. The `useAuth` hook likely abstracts this logic.
- **Storage:** Supabase Storage is used for storing images associated with thoughts.
- **Edge Functions:** Serverless functions in `supabase/functions/` handle backend logic, such as `generate-thought-embedding` and `search-thoughts`.

## 4. Core Features & User Flows

### 4.1. Data Model

- **Thoughts:** The central data element. A thought has an image, a text description, a vector embedding (for search), and a type: `question`, `answer`, or `document`.
- **Teams:** Users are organized into teams. Thoughts are scoped to a team, which provides a mechanism for data filtering and security. Each user has a default "Personal" team.
- **Relationships:** `Questions` can be associated with multiple `answers` and `documents` within the same team, forming a threaded conversation.

### 4.2. Key Features

- **Knowledge Base:** An AI chatbot that can answer questions, eventually using RAG (Retrieval-Augmented Generation) to pull context from the user's thoughts database.
- **Camera:** The primary input method. Users take a picture, add a description, and classify it as a question, answer, or document.
- **Thoughts Feed:** A chronological list of questions from the user's selected teams, with filtering capabilities.
- **Question Thread:** A detailed view of a question, showing its associated answers and documents in a chat-like interface.

## 5. UI and Styling

The design philosophy emphasizes a clean, memorable, and modern look suitable for a knowledge application.

- **Principles:**
  - Prefer descriptive icons over text labels.
  - Use rounded UI elements for a softer feel.
  - For navigation bars, selected items are indicated by a highlight color rather than borders.
- **Implementation:** Styling is likely done via React Native's `StyleSheet` API. The `components/ui/` directory holds foundational, generic components that are composed to build feature-specific components.

## 6. Guidelines for AI Agent

When making changes to the codebase, please adhere to the following:

1.  **Consult Key Files First:**
    - `package.json`: To check versions and dependencies.
    - `_docs/project-overview_2.md`: For the original product requirements and vision.
    - This document (`project-overview-4.md`): For technical architecture.
    - `app/`: To understand routing before adding or changing screens.
    - `lib/supabase.ts`: For Supabase client configuration.
    - `hooks/`: To reuse or create shared logic.
2.  **Respect the Architecture:**
    - Follow the existing patterns for routing, state management, and component structure.
    - Add new routes by creating files/directories in the `app/` folder.
    - Place reusable logic in `hooks/` and UI components in `components/`.
3.  **Maintain Type Safety:** Use and update the TypeScript types, especially the Supabase types in `types/database.ts`, which may need to be regenerated after a database migration.
4.  **Backend Changes:** For changes involving the database, create a new Supabase migration file in `supabase/migrations/`. For new backend logic, consider creating a new Edge Function.
5.  **Follow Coding Style:** Adhere to the existing code style for consistency. Note the user rule to prefer functional patterns, descriptive names, and block comments for functions. 