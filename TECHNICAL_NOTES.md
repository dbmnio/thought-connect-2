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

## Gesture Handler and Reanimated Integration Issues

A series of issues were encountered when integrating `react-native-gesture-handler` and `react-native-reanimated` for a drawing feature.

### 1. Problem: `GestureDetector must be used as a descendant of GestureHandlerRootView`

- **Symptom:** The application crashes upon trying to use a gesture, with an error message indicating `GestureDetector` is not inside a `GestureHandlerRootView`.
- **Root Cause:** The `react-native-gesture-handler` library requires the entire application (or at least the part of the component tree using gestures) to be wrapped in a `GestureHandlerRootView` component. This provider is necessary to register and manage gesture handling at the native level.
- **Solution:** Wrap the root component of the application in `GestureHandlerRootView`. In an Expo Router project, the ideal location for this is in the root layout file, `app/_layout.tsx`.

### 2. Problem: `ReanimatedError` and State Corruption (`paths.map is not a function`)

- **Symptom:** The app crashes when a gesture event attempts to update React state. The error message may vary, but common forms include `ReanimatedError: Tried to synchronously call a non-worklet function on the UI thread` or a `TypeError` on re-render (e.g., `paths.map is not a function`), which indicates a state variable has become `undefined`.
- **Root Cause:** Gesture events in `react-native-gesture-handler` run on the native UI thread (as a "worklet" in `reanimated`'s terminology), while React's state (`useState`) lives on the main JavaScript thread. It is illegal to directly call a state-setting function from a worklet. Doing so can lead to race conditions and corrupted state.
- **Solution:** Use the tools provided by `reanimated` to bridge the two threads safely.
  1.  Use `useSharedValue` to manage "live" data that changes frequently during the gesture on the UI thread (e.g., the current drawing path).
  2.  When the gesture ends (`onEnd`), use `runOnJS` to safely call a function that updates the React state on the JavaScript thread.
  3.  Crucially, ensure that the data passed via `runOnJS` is a plain JavaScript object or primitive. Do not pass a shared value directly. Read its `.value` property on the UI thread *before* calling `runOnJS`.
  4.  To prevent a "flicker" where the live path disappears before the state-driven path appears, avoid clearing the `useSharedValue` in the `onEnd` handler. The new path will simply overwrite it on the next gesture start.

## Navigation State Management: Route Params vs. Global Store

### 1. Problem Description

- **Symptom:** After taking a picture on the camera screen, the app would navigate to the photo editor screen and then immediately navigate back to the camera screen.
- **Root Cause:** The camera screen was saving the captured image URI to a Zustand global store, but the photo editor was designed to read the URI from route parameters. Since no URI was passed in the params, the editor screen's logic would detect a missing URI and trigger a `router.back()` call.
- **Solution:** Use route parameters for passing transient, screen-specific data.
  - The `takePicture` function was modified to pass the image URI as a route parameter using `router.push({ pathname: '...', params: { uri } })`.
  - The dependency on the Zustand store for this data flow was removed, making the navigation more robust and the components less coupled.

## Metro Bundler Cache Issues

### 1. Problem Description

- **Symptom:** The Metro bundler fails to start or throws a file-not-found error (e.g., `ENOENT: no such file or directory, open '.../valueUnpacker'`) for a file that does not exist in the project.
- **Root Cause:** This error typically occurs after installing new dependencies or changing the project configuration. Metro's cache can become corrupted or stale.
- **Solution:** Stop the development server and restart it with the `--clear` flag to force Metro to rebuild its cache from scratch.
  ```bash
  npx expo start --clear
  ``` 