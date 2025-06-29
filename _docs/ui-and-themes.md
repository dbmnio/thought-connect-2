# UI Components & Theme Documentation

This document outlines the UI component library and theming strategy for the SnapConnect application, implemented under the "Clarity Deepdive" design philosophy.

## 1. Theme: Clarity Deepdive

The "Clarity Deepdive" theme is designed to be clean, modern, and focused on content. It is inspired by the provided UI mockups, featuring a soft color palette, rounded elements for an approachable feel, and clear typography.

### Implementation

The theme is implemented using **NativeWind** and configured in `tailwind.config.js`. This provides a utility-first CSS approach that allows for rapid and consistent styling.

### Color Palette

| Category  | Name        | Hex Code  | Tailwind Class              |
| :-------- | :---------- | :-------- | :-------------------------- |
| Background| Primary     | `#FFFFFF` | `bg-background-primary`     |
|           | Secondary   | `#F0F2F5` | `bg-background-secondary`   |
| Accent    | Primary     | `#4A90E2` | `bg-accent-primary`         |
|           | Secondary   | `#50E3C2` | `bg-accent-secondary`       |
|           | Tertiary    | `#F5A623` | `bg-accent-tertiary`        |
| Text      | Primary     | `#333333` | `text-text-primary`         |
|           | Secondary   | `#888888` | `text-text-secondary`       |
| Status    | Success     | `#28A745` | `bg-status-success`         |
|           | Pending     | `#FFC107` | `bg-status-pending`         |

---

## 2. Common Components

These are the foundational, reusable components located in `/components/common/`.

### `Card.tsx`
- **Purpose**: A flexible container for displaying content.
- **Rationale**: Provides a consistent, styled wrapper with rounded corners (`rounded-2xl`) and a subtle shadow (`shadow-sm`) for depth, forming the base for most UI elements like `ThoughtCard`.

### `RoundedButton.tsx`
- **Purpose**: A standard button for primary and secondary actions.
- **Rationale**: Features fully rounded ends (`rounded-full`) for a soft, modern look. Includes `primary` (accent color) and `secondary` (light grey) variants for visual hierarchy.

### `CircularButton.tsx`
- **Purpose**: A circular button intended primarily for icon-based actions.
- **Rationale**: Ideal for single, iconic actions like the camera shutter button. Supports theme-based color variants.

### `Header.tsx`
- **Purpose**: A persistent header for the top of each screen.
- **Rationale**: Uses `SafeAreaView` to avoid system UI overlap. It's designed with left and right content slots for flexible arrangement of titles and action icons.

### `Icon.tsx`
- **Purpose**: A wrapper for displaying icons consistently.
- **Rationale**: Abstracts the `@expo/vector-icons/Feather` library. This allows for easy use of a consistent, line-art icon style throughout the app and simplifies potential future changes to the icon set.

### `Modal.tsx`
- **Purpose**: A reusable modal dialog for pop-up content.
- **Rationale**: Provides a standardized way to present information or forms over the main view, with a semi-transparent backdrop to maintain context.

---

## 3. Feature Components

These components are specific to certain app features and are located in subdirectories like `/components/thoughts/`.

### `ThoughtCard.tsx`
- **Purpose**: Displays a single "thought" (question, answer, or document).
- **Rationale**: The core visual unit for the `thoughts` feature. It uses the `Card` component as a base and includes an image, description, and a footer that dynamically changes its icon and colors based on the `thought.type`, providing clear visual cues.

### `ThoughtList.tsx`
- **Purpose**: Renders a vertical list of `ThoughtCard` components.
- **Rationale**: Utilizes React Native's `FlatList` for efficient, high-performance scrolling of potentially long lists of thoughts.

---

## 4. Design Inspiration: UI Mockup Analysis

The visual direction of the application is heavily inspired by the provided UI mockup image. The following principles were extracted and have guided the implementation of the component library:

- **Overall Aesthetic**: The inspiration image projects a clean, soft, and modern aesthetic that prioritizes content and user comfort. The design feels approachable and avoids visual clutter, which is the core goal of the "Clarity Deepdive" theme.

- **Layout and Spacing**: The layout relies on a card-based system with generous use of whitespace. This creates a breathable, organized interface where each piece of information has its own distinct space. Our components (`Card`, `ThoughtCard`) directly implement this by using significant padding and margins.

- **Component Styling**:
  - **Rounded Corners**: A defining feature is the use of heavily rounded corners on all major elements, including cards, buttons, and input fields. We have adopted this (`rounded-2xl` for cards, `rounded-full` for buttons) to create a soft and friendly UI.
  - **Subtle Depth**: A gentle `shadow-sm` is applied to card elements. This creates a subtle sense of depth and layer, making the UI feel more tangible and less flat, as seen in the mockup.
  - **Color Feel**: While the "Clarity Deepdive" palette has specific colors, the *application* of color is inspired by the mockup's use of a primary accent for key actions and softer, muted tones for background and secondary elements.

- **Typography**: The mockup uses a clean, sans-serif font with a clear hierarchy (larger text for titles, smaller for details). This principle of high readability and clear structure is a guideline for our text styling.

---

## 5. Future & Existing Feature Components

This section outlines the plan for the remaining components, which are scoped to specific features of the application, as well as those already implemented.

### Auth Components (`/components/auth/`)
- **`AuthInput.tsx`**
  - **Status**: Future.
  - **Purpose**: A standardized text input field for use in authentication forms.
  - **Rationale**: Ensures a consistent look and feel for all text entry on the sign-in and sign-up screens, including themed styling for focus states and labels.
- **`AuthButton.tsx`**
  - **Status**: Future.
  - **Purpose**: The primary call-to-action button for auth forms (e.g., "Sign In", "Create Account").
  - **Rationale**: A dedicated component, likely built on `RoundedButton`, to provide consistent styling and behavior for all authentication-related actions.

### Thoughts Components (`/components/thoughts/`)
- **`SearchBar.tsx`**
  - **Status**: Future.
  - **Purpose**: A styled text input for searching and filtering the list of thoughts.
  - **Rationale**: A dedicated search component that will be styled to fit the "Clarity Deepdive" theme, featuring a search icon and rounded edges to match the overall aesthetic.
- **`FilterToggle.tsx`**
  - **Status**: Future.
  - **Purpose**: A set of toggle buttons for applying filters like "My Thoughts" or "Open".
  - **Rationale**: Provides users with a quick and intuitive way to segment the `ThoughtList`. The design will feature clear visual states for active and inactive filters.

### Camera Components (`/components/camera/`)
- **`CameraControls.tsx`**
  - **Status**: Future.
  - **Purpose**: A container for the main capture actions on the camera screen.
  - **Rationale**: Will hold the three `CircularButton` instances ("Ask", "Answer", "Document") and manage their layout, ensuring they are presented clearly over the camera view.
- **`DrawingCanvas.tsx`**
  - **Status**: Future.
  - **Purpose**: A view for performing basic annotations on a captured image.
  - **Rationale**: Provides a simple, intuitive interface for users to draw on or highlight parts of an image before posting it as a thought, adding a layer of communicative richness.

### Team Components (`/components/team/`)
- **`TeamListItem.tsx`**
  - **Status**: Future.
  - **Purpose**: A component to display a single team in a list on the "Team Change" page.
  - **Rationale**: A dedicated row component that will clearly display the team name and indicate the currently selected team, providing a clear and tappable target.
- **`CreateTeamModal.tsx`**
  - **Status**: Future.
  - **Purpose**: A modal dialog form for creating a new team.
  - **Rationale**: Leverages our `Modal` component to present a focused form for creating a new team without navigating away from the current screen. 