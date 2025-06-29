# Technical Notes

This document contains notes on technical challenges and solutions encountered during the development of the ThoughtConnect application. It is intended for developers and AI agents to understand past decisions and debug future issues.

## `expo-camera` Black Screen Issue in Tab Navigator

### 1. Problem Description

- **Symptom:** When a screen containing the `expo-camera` `CameraView` component is placed within a tab navigator (like Expo Router's `Tabs`), the camera preview appears correctly on the first visit. However, after navigating to another tab and then returning, the camera preview becomes a black screen and is non-functional.
- **Environment:** This issue was primarily observed on Android but can affect iOS as well. It occurs because tab navigators often keep inactive screens mounted in the background to preserve their state.
- **Root Cause:** When the camera screen becomes inactive, the underlying native camera view loses its connection to the device's camera hardware. Although the React component is still mounted, it cannot resume the preview feed when the screen becomes active again, resulting in a black view.

### 2. Investigation and Attempted Solutions

Several approaches were attempted to resolve this issue:

#### Attempt 1: `useFocusEffect` with `resumePreview` and `pausePreview` (Incorrect)

- **Logic:** Use the `useFocusEffect` hook to get a reference to the `CameraView` and manually call `cameraRef.current.pausePreview()` when the screen is unfocused and `cameraRef.current.resumePreview()` when it is focused.
- **Result:** This failed to solve the problem. The `pausePreview` and `resumePreview` methods proved insufficient for re-establishing the hardware connection after the tab was backgrounded.

#### Attempt 2: `useIsFocused` from `@react-navigation/native` (Failed due to import issues)

- **Logic:** The `useIsFocused` hook returns a boolean indicating if the screen is currently focused. The plan was to conditionally render the `CameraView` only when `isFocused` was `true`.
- **Result:** This led to a series of import errors and dependency issues, suggesting it was not the right tool for Expo Router or that the environment was not configured correctly for it. This path was abandoned.

### 3. The Working Solution: `useFocusEffect` with Conditional Rendering

The successful solution involves forcing the `CameraView` component to completely unmount when the screen is not focused and remount when it becomes focused. This ensures that a fresh camera instance is created with a new connection to the hardware every time the user navigates to the camera tab.

- **Implementation:**
  1.  Introduce a state variable, e.g., `const [isCameraActive, setCameraActive] = useState(true);`.
  2.  Use the `useFocusEffect` hook from `expo-router`.
  3.  Inside the effect, set `isCameraActive` to `true` when the screen gains focus.
  4.  In the effect's cleanup function (the `return` statement), set `isCameraActive` to `false` when the screen loses focus.
  5.  Wrap the `<CameraView />` component in a conditional render based on the state variable: `{isCameraActive && <CameraView />}`.

- **Example Code:**
  ```tsx
  import { useState, useCallback } from 'react';
  import { CameraView } from 'expo-camera';
  import { useFocusEffect } from 'expo-router';

  export default function CameraScreen() {
    const [isCameraActive, setCameraActive] = useState(true);

    useFocusEffect(
      useCallback(() => {
        setCameraActive(true); // Screen is focused
        return () => {
          setCameraActive(false); // Screen is unfocused
        };
      }, [])
    );

    // ... other logic ...

    return (
      <View>
        {isCameraActive && <CameraView />}
      </View>
    );
  }
  ```

- **Why it Works:** By toggling `isCameraActive`, we are not just hiding the component; we are adding it to and removing it from the React component tree. This forces a full unmount/mount lifecycle, which correctly releases and re-acquires the native camera resources, preventing the black screen issue. This is the recommended pattern for handling resource-intensive components like the camera within a tab-based navigation flow. 