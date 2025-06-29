# Thought Connect 🧠⚡

Thought Connect is a collaborative, AI-first mobile application designed to help teams capture, organize, and search for information seamlessly. It transforms unstructured data, like images and notes, into a structured, searchable knowledge base.

## Overview

In today's fast-paced environments, valuable information is often scattered across different formats and platforms. A photo of a whiteboard from a brainstorm, a quick note, or a question asked in passing can all contain critical knowledge. Thought Connect provides a central hub for this information, using AI to make it effortlessly discoverable.

Users can create "Thoughts," which can be simple text notes or images. The app uses OpenAI's GPT-4o Vision model to automatically analyze images and generate rich, detailed descriptions. These descriptions are then converted into vector embeddings and stored in a Supabase Postgres database with the `pgvector` extension, enabling powerful semantic search capabilities.

## Features

- **Team-Based Collaboration**: Organize work and knowledge within dedicated teams.
- **Capture Thoughts**: Create thoughts from text or by uploading images directly from the camera or gallery.
- **AI-Powered Image Analysis**: Images are automatically described and tagged by an AI vision model.
- **Semantic Search**: Find relevant information by searching for concepts and ideas, not just keywords. The app understands the *meaning* behind your query.
- **Knowledge Base**: A dedicated view to search and explore the collective knowledge of your teams.
- **Secure and Scalable**: Built on Supabase, ensuring row-level security so users only see data from teams they belong to.

## Architecture

Thought Connect is built on a modern, scalable stack designed for AI-powered applications.

#### **Frontend**

- **React Native & Expo**: For building a cross-platform mobile application for iOS, Android, and Web from a single codebase.
- **Expo Router**: Implements file-based routing, creating a clean and maintainable navigation structure.
- **Zustand**: For lightweight, simple state management.

#### **Backend**

- **Supabase**: The all-in-one backend-as-a-service platform providing:
  - **PostgreSQL Database**: The primary data store, supercharged with the `pgvector` extension for storing and querying vector embeddings.
  - **Auth**: Manages user authentication and authorization securely. Row-Level Security (RLS) is extensively used to enforce data access policies.
  - **Storage**: For securely storing user-uploaded images.
  - **Edge Functions**: Serverless functions written in Deno (TypeScript) that handle business logic requiring secure environment variables or intensive computation.
    - `generate-thought-embedding`: Triggered when a new thought with an image is created. It downloads the image, uses OpenAI GPT-4o to generate a description, creates a vector embedding from that description, and updates the database.
    - `search-thoughts`: Takes a user's search query, embeds it using OpenAI, and queries the database to find the most similar thoughts using cosine similarity.

#### **AI & Machine Learning**

- **OpenAI**:
  - **GPT-4o**: Used for its state-of-the-art vision capabilities to analyze images.
  - **`text-embedding-3-small`**: A powerful and efficient model used to convert text (both AI-generated descriptions and user queries) into vector embeddings.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (LTS version)
- `npm` or your preferred package manager
- Expo CLI: `npm install -g expo-cli`
- Supabase CLI: `npm install -g supabase`

### 1. Clone the Repository

```bash
git clone <repository-url>
cd thought-connect-2
```

### 2. Install Dependencies

Install the required npm packages.

```bash
npx expo install
```

### 3. Set up Supabase

NOTE: There is no need to perform this step if you are using the production
      database.  Configure `.env` appropriately to do so.
      See `.env.example` for a template of used variables.

1.  **Log in to Supabase:**
    ```bash
    supabase login
    ```

2.  **Link your local project to your Supabase project:**
    (Replace `[PROJECT_ID]` with your actual Supabase project ID from your project's dashboard URL)
    ```bash
    supabase link --project-ref [PROJECT_ID]
    ```

3.  **Create an Environment File:**
    Create a new file `app.d.ts` in the root of the project and add your Supabase and OpenAI credentials.

    ```typescript
    // app.d.ts
    declare namespace NodeJS {
      interface ProcessEnv {
        EXPO_PUBLIC_SUPABASE_URL: string;
        EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
        OPENAI_API_KEY: string;
      }
    }
    ```
    *You will need to create a `.env` file in the root and add the values there. Do not commit this file to version control.*

4.  **Push Database Migrations:**
    Apply all the database migrations to set up your schema, tables, and functions.

    ```bash
    supabase db push
    ```
   *Note: If you have issues, you may need to run `supabase db reset` which will wipe the remote database before pushing.*


### 4. Run the Application

Start the Expo development server.

```bash
npx expo start
```

This will open the Expo developer tools in your browser. You can then run the app on a simulator (iOS/Android) or on a physical device using the Expo Go app.

## Project Structure

The codebase is organized to be modular, scalable, and easy for AI tools and developers to understand.

```
thought-connect-2/
├── app/                # Expo Router file-based routes
│   ├── (app)/          # Authenticated user screens
│   └── (auth)/         # Sign-in/Sign-up flow
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable React components
│   ├── knowledge-base/ # Components for the search/chat UI
│   ├── team/
│   └── thoughts/
├── hooks/              # Custom React hooks
├── lib/                # Core logic, Supabase client, stores
├── supabase/           # Supabase project configuration
│   ├── functions/      # Edge Functions source code
│   └── migrations/     # Database schema migrations
└── package.json        # Project dependencies and scripts
```

This comprehensive structure ensures that the application is easy to navigate, maintain, and scale.

## Planned Features

- [ ] Support landscape mode in photo editor