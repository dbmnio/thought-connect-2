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