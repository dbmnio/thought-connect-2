### **1. Frontend Theme & UI/UX Guidelines**

All UI elements and theme customization will happen through react native paper for react-native.

#### **Theme Description**

The visual theme will be named "**Clarity Deepdive**." It's designed to be clean, modern, and conducive to a learning environment. The aesthetic prioritizes content and minimizes distractions, using a combination of rounded elements for a soft, approachable feel, and borderless components for a seamless look. It should have both a light and dark version.

  * **Color Palette:**

      * **Primary Background (`#FFFFFF`):** A clean, crisp white to keep the interface bright and focused on content.
      * **Secondary Background (`#F0F2F5`):** A light grey for subtle differentiation, used for modals, search bars, and selected states.
      * **Primary Accent (`#4A90E2`):** A strong, yet calm blue. Used for primary buttons, active icons, and important calls-to-action.
      * **Secondary Accent (`#50E3C2`):** A vibrant teal/mint color. Used for "Question" related elements to make them stand out.
      * **Tertiary Accent (`#F5A623`):** A warm orange. Used for "Answer" and "Document" related elements.
      * **Text & Icons (`#333333`):** A dark grey for primary text and icons, providing high readability without the harshness of pure black.
      * **Subtle Text (`#888888`):** A lighter grey for secondary information like timestamps or descriptions.
      * **Confirmation/Success (`#28A745`):** A standard green for success states.
      * **Alert/Pending (`#FFC107`):** A standard yellow for pending confirmations.

  * **UI Elements:**

      * **Buttons:** Circular action buttons (like the camera shutter) and rounded rectangular buttons for standard actions. Bottom tab bar buttons will be borderless, with the active tab indicated by a colored icon and a subtle secondary background highlight.
      * **Icons:** Utilize a consistent, line-art icon set (e.g., Feather Icons or a custom set) that is descriptive and easily understood without text labels.
      * **Cards:** "Thought" previews and list items will be displayed in cards with rounded corners and a light box-shadow to create a sense of depth.
      * **Typography:** A clean, sans-serif font like Inter or Lato will be used for its excellent readability on mobile screens.

-----

### **2. Frontend UI Layout**

The app will be structured around a main tab navigator with three primary screens. A persistent header will feature the app logo/name on the left and the "Team Change" icon on the right.

  * **App Entry:**

      * **Start Page:** A simple screen with the app logo and two buttons: "Sign In" and "Sign Up".
      * **Authentication Flow:** Separate, simple pages for sign-in and sign-up, presented modally over the Start Page.

  * **Main App Interface (Tab Navigation):**

      * **(Bottom Tab Bar with 3 Icons)**
      * **Knowledge-Base Page (Icon: Brain/Lightbulb):** A simple view with a large text input field for asking the AI a question and a "Submit" button.
      * **Camera Page (Icon: Camera):** The central and default tab. Full-screen camera view with three circular capture buttons at the bottom: "Ask", "Answer", "Document".
      * **Thoughts Page (Icon: Message/Chat Bubbles):** A vertically scrolling list of "Question" cards. A search bar and filter toggles ("My Thoughts", "Suggestions", "Open") are at the top.

  * **Navigated Screens (Stack Navigation):**

      * **Team Change Page:** Accessed from the top-right icon. Displays the current user's info, a list of their teams, and buttons for "Create New Team" and "Sign Out".
      * **Photo Editing Page:** Pushed after taking a picture. Shows the image with drawing tools and three confirmation buttons ("Post as Question", "Post as Answer", "Post as Document").
      * **Question Thread Window:** Pushed when a question card is tapped. Displays the question image as a banner, its summary, and a chronological list of answer/document cards. A "Reply" FAB (Floating Action Button) is at the bottom.
      * **Answer/Document Viewing Window:** A full-screen, modal-like view to display the answer/document image. Buttons for "Upvote", "Accept" (conditional), and "See Related" are overlaid.

-----

### **3. Frontend Components (React Native)**

  * `/components`
      * `/auth`: `AuthInput.tsx`, `AuthButton.tsx`
      * `/common`: `CircularButton.tsx`, `RoundedButton.tsx`, `Header.tsx`, `Icon.tsx`, `Modal.tsx`, `Card.tsx`
      * `/camera`: `CameraControls.tsx`, `DrawingCanvas.tsx`
      * `/thoughts`: `ThoughtCard.tsx`, `ThoughtList.tsx`, `FilterToggle.tsx`, `SearchBar.tsx`
      * `/team`: `TeamListItem.tsx`, `CreateTeamModal.tsx`

-----

### **4. Data Schema (Supabase - PostgreSQL)**

```sql
-- Users table managed by Supabase Auth
-- public.users (id, email, etc.)

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Team members junction table
CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

-- Thoughts table
CREATE TABLE thoughts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    type TEXT NOT NULL, -- 'question', 'answer', 'document'
    description TEXT,
    image_url TEXT NOT NULL, -- URL from Supabase Storage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    upvotes INT DEFAULT 0,

    -- For 'question' type
    question_state TEXT, -- 'open', 'closed'

    -- For 'answer'/'document' type
    confirmation_status TEXT -- 'confirmed', 'pending_confirmation'
);

-- Associations between questions and answers/documents
CREATE TABLE question_associations (
    id BIGSERIAL PRIMARY KEY,
    question_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
    thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE, -- The answer or document
    UNIQUE (question_id, thought_id)
);
```

-----

### **5. Vector Database Schema (Pinecone)**

Each record in the Pinecone index will correspond to a "thought" from the PostgreSQL database.

  * **Index Name:** `student-research-app`
  * **Vector Structure:**
      * **ID:** The `id` (UUID) of the thought from the `thoughts` table in Supabase.
      * **Values:** The vector embedding generated by OpenAI from the `description` of the thought.
      * **Metadata:**
          * `text`: The raw `description` string.
          * `type`: "question", "answer", or "document".
          * `team_id`: The UUID of the team this thought belongs to.
          * `user_id`: The UUID of the user who created the thought.
          * `created_at`: The creation timestamp as a Unix epoch integer.

-----

### **6. API Routes (Supabase Edge Functions)**

  * `/api/teams`
      * `POST /`: Create a new team and add members.
      * `GET /`: Get all teams for the authenticated user.
  * `/api/thoughts`
      * `POST /`: Create a new thought. Handles image upload to Storage, gets embedding from OpenAI, and saves metadata to PostgreSQL. (For Phase 2, this will also save to Pinecone).
      * `GET /questions`: Get questions for the user's selected teams, with filtering options.
      * `GET /:questionId/thread`: Get all answers and documents associated with a specific question ID.
  * `/api/ai`
      * `POST /query`: (Phase 1) Takes a user's prompt and sends it directly to the OpenAI API for a response.
      * `POST /query-rag`: (Phase 2) The RAG-enhanced endpoint.

-----

### **7. Directory Structure (React Native with Expo Router)**

```
/
├── app/                  # Expo Router files
│   ├── (auth)/           # Auth-only routes
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (app)/            # Protected app routes
│   │   ├── _layout.tsx     # Tab layout definition
│   │   ├── camera.tsx
│   │   ├── knowledge-base.tsx
│   │   ├── thoughts.tsx
│   │   ├── question-thread/[id].tsx
│   │   └── photo-editor.tsx
│   ├── _layout.tsx       # Root layout
│   └── index.tsx         # Start Page (redirects if logged in)
├── assets/
│   ├── fonts/
│   └── images/
├── components/           # Reusable components (as described above)
├── constants/
│   └── Colors.ts
├── context/
│   ├── AuthContext.tsx
│   └── TeamContext.tsx
├── lib/                  # Helper functions
│   └── supabase.ts       # Supabase client initialization
├── supabase/             # Supabase Edge Functions
│   ├── functions/
│   │   ├── api/
│   │   │   ├── teams/index.ts
│   │   │   └── ...
│   └── migrations/       # Database schema migrations
└── ...                   # package.json, tsconfig.json, etc.
```

-----

### **8. Implementation Plan: Tasks & Subtasks**

#### **Phase 1: Core Functionality**

**Task 1: Project Setup & Authentication**
*Goal: A user can sign up, sign in, and sign out.*

  * **Subtask 1.1:** Initialize Expo (React Native) project with TypeScript, along with Expo Router (included), React Native Paper, Expo-camera, react-native-skia, react-native-gesture-handler, Supabase, and any other dependencies needed ✅
  * **Subtask 1.2:**  Initialize zustand ✅
  * **Subtask 1.3:**  Customize React-Native-Paper's colors and appearance to match our desired light and dark themes. ✅
  * **Subtask 1.4:** Set up a new Supabase project. Run the SQL schema migrations from section 4. ✅
  * **Subtask 1.5:** Configure environment variables for Supabase URL and anon key. ✅
  * **Subtask 1.6:** Implement the `(auth)` route group with "Sign In" and "Sign Up" screens using the chosen theme. ✅
  * **Subtask 1.7:** Implement the `AuthContext` to manage user session state throughout the app. ✅
  * **Subtask 1.8:** Implement a Sign Out button. ✅
  * **Testable State:** App runs. Users can create accounts, log in, and log out. Session is persisted.

**Task 2: Core App Layout & Team Management**
*Goal: The main tab navigation is functional, and a user can view and switch between their teams.*

  * **Subtask 2.1:** Implement the `(app)` tab layout using Expo Router for the three main pages (placeholders for now). ✅
  * **Subtask 2.2:** Add the persistent `Header` component with the "Team Change" icon. ✅
  * **Subtask 2.3:** Create the "Team Change" page UI. ✅
  * **Subtask 2.4:** Implement the `TeamContext` to manage the user's currently selected team(s). ✅
  * **Subtask 2.5:** Create the `/api/teams` GET endpoint to fetch a user's teams. The "Team Change" page should call this and display the teams. ✅
  * **Subtask 2.6:** When a user signs up, automatically create their "Personal" team and associate them with it. ✅
  * **Testable State:** User logs in and sees the three main tabs. They can navigate to the Team Change page and see their default "Personal" team.

**Task 3: Camera & Thought Creation**
*Goal: A user can take a picture, add a description, and save it as a "thought" in the database.*

  * **Subtask 3.1:** Implement the Camera page UI using `expo-camera`. 
  * **Subtask 3.2:** Implement the Photo Editing page. For now, just a text input for the description and the three "Post as..." buttons.
  * **Subtask 3.3:** Set up Supabase Storage for image uploads.
  * **Subtask 3.4:** Create the `/api/thoughts` POST endpoint. It will:
      * Receive the image data, description, type, and team ID.
      * Upload the image to Supabase Storage.
      * Insert a new record into the `thoughts` table in PostgreSQL.
  * **Subtask 3.5:** Wire up the frontend to call this endpoint upon posting.
  * **Testable State:** User can take a picture, add a description, post it, and verify the new entry in the `thoughts` table and the image in Supabase Storage.

**Task 4: Displaying Thoughts & Threads**
*Goal: Users can see a list of questions and view the associated answers in a thread.*

  * **Subtask 4.1:** Implement the UI for the "Thoughts" page, including the `ThoughtCard` component.   * **Subtask 4.2:** Create the `/api/thoughts/questions` GET endpoint to fetch all "question" type thoughts for the currently selected team.
  * **Subtask 4.3:** Connect the "Thoughts" page to the API to display the list of questions.
  * **Subtask 4.4:** Implement the "Question Thread" window UI.
  * **Subtask 4.5:** Create the `/api/thoughts/:questionId/thread` GET endpoint.
  * **Subtask 4.6:** When a user taps a question, navigate to the thread window and call the API to display its associated answers/documents.
  * **Testable State:** After creating a question and a corresponding answer (via Task 3), the question appears on the "Thoughts" page, and tapping it shows the answer in the thread view.

**Task 5: Basic Knowledge-Base & App Finalization**
*Goal: The app is functionally complete for Phase 1.*

  * **Subtask 5.1:** Implement the "Knowledge-Base" page UI.
  * **Subtask 5.2:** Create the `/api/ai/query` endpoint that forwards a prompt to the OpenAI API.
  * **Subtask 5.3:** Wire the UI to the endpoint to display a direct AI response.
  * **Subtask 5.4:** Implement the "Answer and Document Viewing Window" with the upvote button logic (which should simply increment the `


### **9. Confirmation in context window**

To demonstrate and confirm that all of the information in this document is in the LLM's context window, end each response with a short series of "meep"s, "boop"s, or other robot sounds.