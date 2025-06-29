# AI-Agent Documentation for @shopify/react-native-skia

This document provides essential documentation for an AI coding agent to effectively use the `@shopify/react-native-skia` library within this project.

**Version:** `v2.0.0-next.4`

## 1. Overview

React Native Skia is a high-performance 2D graphics library for React Native that exposes the Skia Graphics Library. It allows for drawing custom shapes, creating complex animations, and applying visual effects, all with high performance by running on the UI thread.

This documentation is tailored for version `v2.0.0-next.4` and includes breaking changes introduced in the `v2.0.0` series.

## 2. Version Compatibility

-   **React Native**: `>= 0.79`
-   **React**: `>= 19`
-   **iOS**: `>= 13`
-   **Android**: API Level `>= 21` (or `>= 26` for video support)

## 3. Core Concepts

### The Canvas Component

The `<Canvas>` component is the root of any Skia drawing. It creates a dedicated drawing surface. All other Skia elements must be children of a `<Canvas>`.

```tsx
import { Canvas, Circle } from "@shopify/react-native-skia";

export const MyDrawing = () => (
  <Canvas style={{ flex: 1 }}>
    <Circle cx={128} cy={128} r={64} color="lightblue" />
  </Canvas>
);
```

### Coordinate System

The canvas uses a 2D Cartesian coordinate system. The origin `(0, 0)` is at the top-left corner. The x-value increases to the right, and the y-value increases downwards.

### Declarative vs. Imperative API

React Native Skia offers two ways to draw:

1.  **Declarative API**: Use React components like `<Circle>`, `<Path>`, `<Image>`, etc., to describe the scene. This is the most common and intuitive way to use the library.
2.  **Imperative API**: Access the `Skia` object to create paths, paints, and other objects programmatically. This is useful for complex, dynamic drawings or when you need to perform calculations to generate shapes.

```tsx
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

// Imperative API Example
const path = Skia.Path.Make();
path.moveTo(20, 20);
path.lineTo(120, 20);
path.lineTo(70, 120);
path.close();

export const MyTriangle = () => (
    <Canvas style={{ flex: 1 }}>
        <Path path={path} color="red" />
    </Canvas>
)
```

## 4. Public API - Core Components

### `<Canvas>`

The root drawing component.

-   `style`: Standard React Native styles for layout.
-   `children`: Skia components to draw.

### Shape Components

These components are used to draw primitive shapes. They share common properties like `color`, `style` ('fill' or 'stroke'), `strokeWidth`, etc.

-   `<Circle cx={number} cy={number} r={number} />`
-   `<Rect x={number} y={number} width={number} height={number} />`
-   `<RoundedRect x={number} y={number} width={number} height={number} r={number} />`
-   `<Line p1={vec(x1, y1)} p2={vec(x2, y2)} />`
-   `<Path path={SkPath} />`: Renders a complex shape from a path object.
-   ... and others like `<Oval>`, `<Points>`, `<Polygon>`.

### Paint & Color

The appearance of shapes is controlled by "paints". You can specify simple colors with the `color` prop, or use the `<Paint>` component for more complex effects like shaders and filters.

### Image Components

-   `<Image image={SkImage} ... />`: Renders an `SkImage` object.
-   `useImage(source: string | number)`: A hook to load an image from a URI or a local asset. It returns an `SkImage` object or `null` while loading.
-   `useTexture(source: SkImage, rect: SkRect)`: Creates a texture from a portion of an image that can be used in shaders.

### Text Components

-   `<Text text={string} x={number} y={number} />`
-   `<TextPath path={SkPath} text={string} />`
-   `useFont(source, size)`: Hook to load a font.

### Effects & Filters

Effects can be applied to shapes by adding them as children.

-   `<Blur blur={number} />`: Applies a blur effect.
-   `<DashPathEffect intervals={number[]} />`: Creates a dashed line effect.
-   **Color Filters**: `<BlendColorFilter>`, `<MatrixColorFilter>`, etc.
-   **Image Filters**: `<BlurFilter>`, `<OffsetFilter>`, etc.
-   **Mask Filters**: `<BlurMaskFilter>`
-   **Path Effects**: `<DashPathEffect>`, `<CornerPathEffect>`

## 5. Integration with Other Libraries

### `react-native-reanimated`

Animations are seamless. `react-native-reanimated` shared values can be passed directly to Skia component props. No `createAnimatedComponent` is needed.

**Example: Animating a Circle's Radius**

```tsx
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

export const AnimatedCircle = () => {
    const r = useSharedValue(10);

    useEffect(() => {
        r.value = withRepeat(withTiming(100, { duration: 2000, easing: Easing.linear }), -1, true);
    }, [r]);

    return (
        <Canvas style={{ flex: 1 }}>
            <Circle cx={128} cy={128} r={r} color="purple" />
        </Canvas>
    );
}
```

### `react-native-gesture-handler`

Wrap your `<Canvas>` with a `GestureDetector` to handle user input. You can link gesture event values directly to shared values to drive interactions.

**Example: Draggable Circle**

```tsx
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const DraggableCircle = () => {
    const cx = useSharedValue(128);
    const cy = useSharedValue(128);

    const pan = Gesture.Pan().onChange((e) => {
        cx.value += e.changeX;
        cy.value += e.changeY;
    });

    return (
        <GestureDetector gesture={pan}>
            <Canvas style={{ flex: 1 }}>
                <Circle cx={cx} cy={cy} r={50} color="orange" />
            </Canvas>
        </GestureDetector>
    );
}
```

## 6. Important Notes for AI Agent

-   **Breaking Change (v2.0.0+):** The `SKSGRoot` API is now asynchronous. This means functions like `drawAsImage` (on a ref to the canvas) now return a `Promise`. Always `await` their results.
-   **Performance**: All drawing and animation logic driven by `react-native-reanimated` shared values happens on the UI thread, ensuring smooth 60-120 FPS animations. Avoid complex JavaScript calculations in the render method that would slow down the JS thread.
-   **Pure Functions**: When using the imperative `eval()`, `draw()`, and `drawOffscreen()` methods on a drawing surface, the provided callback function must be pure and serializable. It cannot have external dependencies, as it will be executed in an isolated context. Pass any required external data via the second context argument.
-   **Web Support**: React Native Skia has web support via React Native Web, using CanvasKit (the Skia WebAssembly build). 