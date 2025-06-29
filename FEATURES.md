### Implementation Plan: Photo Editor

This plan outlines the necessary steps to integrate drawing capabilities into the existing photo editor page. It focuses on using robust, well-supported libraries that are compatible with the existing Expo-based project structure.

**1. Technology & Dependencies**

To achieve the desired drawing functionality, we will need a few key libraries.

*   **`react-native-gesture-handler`**: To capture user touch input for drawing on the screen. This is likely already a part of the project.
*   **`react-native-svg`**: To render the drawings as scalable vector graphics overlaid on the image. This is a powerful and flexible way to handle the drawing paths. This is also likely already part of the project.
*   **`react-native-view-shot`**: To capture the final edited image (the original image plus the SVG drawing on top) into a single image file that can be saved. This will likely need to be added as a new dependency.

**Action Item:**
- [✅] Inspect `package.json` to confirm the presence of `react-native-gesture-handler` and `react-native-svg`.
- [✅] If not present, or if `react-native-view-shot` is needed, install them using the Expo-friendly command: `npx expo install react-native-view-shot react-native-svg react-native-gesture-handler`.

---

**2. File Structure & Componentization**

For maintainability and clarity, the new functionality will be encapsulated within the `app/(app)/photo-editor.tsx` file. We can break down the UI into logical components that live inside this file.

*   **`PhotoEditorScreen` (Main Component):**
    - [✅] This will be the main export of the file.
    - [✅] It will fetch the image URI passed through navigation parameters.
    - [ ] It will manage the state of the editor, including the drawing paths and selected tool properties (e.g., color).
    - [✅] It will orchestrate the rendering of the canvas, toolbar, and header buttons.

*   **`DrawingCanvas` (Internal Component):**
    - [✅] **Purpose:** The main interactive area where the image is displayed and drawing occurs.
    - [✅] **Implementation:** It will use an `<Svg>` element from `react-native-svg` layered on top of the image. The user's finger movements, captured by a `PanGestureHandler`, will be translated into SVG `<Path>` data.

*   **`EditorToolbar` (Internal Component):**
    - [✅] **Purpose:** A UI panel for editing controls.
    - [✅] **Implementation:** A simple `View` styled as a toolbar, containing:
        - [✅] **Color Palette:** A series of `TouchableOpacity` elements, each representing a selectable color. Tapping a color will update the drawing tool's state.
        - [✅] **Undo Button:** An icon button that removes the last drawn path from the canvas.

---

**3. State Management**

We will use React's built-in `useState` hook for managing the editor's state within the `PhotoEditorScreen` component. No complex global state management (like Zustand) is necessary for this feature.

- [ ] `imageUri: string`: Stores the URI of the image being edited.
- [ ] `paths: object[]`: An array of path objects, where each object contains the SVG path data (`d`), color, and stroke width.
- [ ] `currentColor: string`: The currently selected color for the pen.

---

**4. Implementation Steps**

Here is a logical sequence for building the feature:

1.  **Setup and Basic Display:**
    - [✅] Verify and install the necessary dependencies as outlined in Step 1.
    - [✅] In `photo-editor.tsx`, modify the component to receive the image URI from the route parameters.
    - [✅] Display the image so that it fills the available screen space.
    - [✅] Configure the screen's header in a `useLayoutEffect` to include "Cancel" and "Done" buttons.

2.  **Implement Drawing on Canvas:**
    - [✅] Wrap the image area with a `PanGestureHandler` from `react-native-gesture-handler`.
    - [✅] Implement the gesture event handlers (`onStart`, `onActive`, `onEnd`) to create and update an SVG path string as the user draws.
    - [✅] Render these paths within an `<Svg>` component that is positioned directly over the image.

3.  **Build the Editor Toolbar:**
    - [✅] Create the `EditorToolbar` component.
    - [✅] Implement the color palette by rendering a list of colored circles. Add `onPress` handlers to update the `currentColor` state.
    - [✅] Implement the "Undo" button's functionality, which will remove the last element from the `paths` array.

4.  **Restore Thought Type Selection Bar:**
    - [✅] Re-introduce the bottom bar UI for selecting thought type (Question, Answer, Document).
    - [✅] Add state to manage the selected type.
    - [✅] The "Done" button will eventually use this state to save the thought correctly.

5.  **Saving the Final Image:**
    - [✅] Wrap the image and the SVG canvas in a `<View>` and attach a `ref` to it.
    - [✅] When the "Done" button is pressed, use the `captureRef` function from `react-native-view-shot` to save the contents of this `View` as a new image file.
    - [✅] Once the new image is saved to a temporary URI, navigate back to the previous screen, passing the new URI as a parameter.

6.  **Styling and Polish:**
    - [ ] Apply styles to the toolbar and its controls to match the application's clean and modern aesthetic, as described in `project-overview-4.md`.
    - [ ] Ensure the layout is responsive and works well on different screen sizes.
    - [ ] Add JSDoc comments to new functions and components to maintain code quality. 

---

### **Implementation Plan: AI Chat Feature**

This plan outlines the steps to integrate a Retrieval-Augmented Generation (RAG) powered AI chat into the knowledge base page.

---

### **1. Backend: Supabase Edge Function for RAG**

We will create a new, dedicated Edge Function to handle the entire RAG process.

*   **Create New Edge Function:**
    *   **Location:** `supabase/functions/ask-ai/index.ts`
    *   **Purpose:** To orchestrate the RAG pipeline: receive a question, find relevant context from the database, and stream an AI-generated answer back to the client.
    *   [✅] **Action Item:** Create the `ask-ai` edge function.

*   **Function Logic (`ask-ai/index.ts`):**
    1.  **Request Handling:** The function will accept a `POST` request with the body `{ question: string, teamIds: string[] }`. It must handle CORS preflight requests.
    2.  **Generate Embedding:** Use the OpenAI API (`text-embedding-3-small` model) to create a vector embedding from the user's `question`.
    3.  **Similarity Search (Retrieval):**
        *   Invoke the `search_thoughts` database function from within the Edge Function.
        *   Pass the `query_embedding` and the `teamIds` to the function to find relevant "thoughts" from the user's selected teams.
    4.  **Prompt Construction (Augmentation):**
        *   Create a system prompt that instructs the AI model to answer the user's question based *only* on the provided context (the retrieved thoughts).
        *   Combine the system prompt, the retrieved context, and the user's `question` into a single prompt.
    5.  **AI Chat Completion (Generation):**
        *   Send the final prompt to the OpenAI Chat Completions API (e.g., `gpt-4o`).
        *   **Crucially, enable streaming** in the API call to receive the response as a stream of tokens.
    6.  **Stream Response:** Return a `ReadableStream` directly to the client, piping the response from OpenAI through the Edge Function. This ensures a real-time, "typing" effect in the UI.

---

### **2. Frontend: React Native UI & State Management**

We will update the existing UI components and add a new state management store for the chat.

*   **State Management (New File):**
    *   **Location:** `lib/stores/useChatStore.ts`
    *   **Technology:** Zustand
    *   **State:** It will manage `messages` (an array of user and bot messages), `isLoading` (boolean), and `error` (string).
    *   **Actions:** Provide actions to add messages and update the loading/error states.
    *   [✅] **Action Item:** Create the `useChatStore`.

*   **API Client Logic (New or Existing File):**
    *   **Location:** `lib/api/chat.ts` (or similar)
    *   **Purpose:** Create a function `askQuestion({ question, teamIds })` that calls the `ask-ai` Supabase Edge Function.
    *   **Implementation:** This function will handle reading the streamed response from the Edge Function. As data chunks are received, it will continuously update the corresponding bot message in the `useChatStore`.
    *   [✅] **Action Item:** Create the `askQuestion` API client.

*   **UI Components:**
    *   **`app/(app)/(tabs)/knowledge-base.tsx`:**
        *   Use the `useTeam` hook to get the currently selected `teamIds`.
        *   Pull `messages`, `isLoading`, and `error` from the `useChatStore` to pass down to child components.
    *   **`components/knowledge-base/InputBar.tsx`:**
        *   On send, add the user's message to `useChatStore`.
        *   Call the `askQuestion` API client function with the message text and `teamIds`.
    *   **`components/knowledge-base/ChatView.tsx`:**
        *   Render the list of `messages` from the `useChatStore`.
        *   Use `@shopify/flash-list` to efficiently display the conversation.
        *   Show a loading indicator for the bot's message while `isLoading` is true.
    *   [✅] **Action Item:** Update all UI components.

---

### **3. Data Flow Summary**

1.  **UI (`InputBar`):** User submits a question.
2.  **UI (`knowledge-base.tsx`):** The question and selected `teamIds` are sent to the `askQuestion` client API function.
3.  **Client API (`askQuestion`):** Invokes the `ask-ai` Supabase Edge Function via `POST` request.
4.  **Backend (`ask-ai`):** Executes the RAG pipeline (embed -> search -> prompt -> generate).
5.  **OpenAI -> Backend:** OpenAI streams the answer back to the Edge Function.
6.  **Backend -> Client:** The Edge Function streams the response to the React Native app.
7.  **Client -> State:** The `askQuestion` function reads the stream and updates the `useChatStore` in real-time.
8.  **State -> UI (`ChatView`):** The UI re-renders progressively as the bot's message is updated, creating a live typing effect. 