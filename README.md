# MapLibre Vue Components Test Project

This project is a test environment for a library of MapLibre GL components built with Vue 3. It demonstrates various reusable map components and includes comprehensive testing using both unit tests and end-to-end tests.

## Components

The library includes the following components:

- **Map** - Core map container component with reactive props (center, zoom, pitch, bearing)
- **MapLayer** - Layer component for adding vector and raster layers
- **MapMarker** - Marker component for point features
- **MapNavigationControl** - Navigation controls (zoom, compass)
- **MapButton** - Custom button controls
- **DrawTool** - Interactive drawing tools for creating geometries
- **GeolocationButton** - User geolocation control
- **ImageryToggleButton** - Toggle between different imagery sources

## Testing Strategy

This project demonstrates two complementary testing approaches to compare their effectiveness for map components:

### Unit/Integration Tests (Vitest)

Located in `src/components/__tests__/`

**Approach:**
- Mock MapLibre GL library completely
- Test in simulated browser environment (happy-dom)
- Focus on component logic, props, events, and Vue reactivity

**Pros:**
- ⚡ **Fast** - Tests run in ~30ms
- 🔧 **Isolated** - No external dependencies or network calls
- 🎯 **Focused** - Tests specific component behavior
- 💰 **Cheap** - No browser overhead

**Cons:**
- 🚫 No actual map rendering
- 🚫 Doesn't catch WebGL/Canvas issues
- 🚫 Mock drift risk (mock behavior vs. real library)

**Run tests:**
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:ui       # UI mode
```

### E2E Tests (Playwright)

Located in `e2e/`

**Approach:**
- Test in real Chromium browser
- Actual MapLibre GL rendering with WebGL
- Real OpenStreetMap tile downloads
- Complete user interaction simulation

**Pros:**
- ✅ **Realistic** - Tests actual rendering and tiles
- ✅ **Comprehensive** - Catches visual and integration bugs
- ✅ **Confident** - Tests what users actually see
- ✅ **Visual** - Can capture screenshots on failure

**Cons:**
- 🐌 Slower - Tests run in ~7 seconds
- 💻 Requires browser infrastructure
- 🌐 Network dependent (tile downloads)
- 🔧 More complex setup

**Run tests:**
```bash
npm run test:e2e           # Headless mode
npm run test:e2e:ui        # Playwright UI
npm run test:e2e:headed    # Watch browser
```

## Comparison Summary

| Aspect | Vitest (Unit) | Playwright (E2E) |
|--------|--------------|------------------|
| **Speed** | ~30ms (7 tests) | ~7s (8 tests) |
| **Environment** | happy-dom | Real Chromium |
| **MapLibre** | Fully mocked | Real library |
| **Rendering** | None | Actual WebGL/Canvas |
| **Tiles** | Mocked | Real OSM downloads |
| **Best for** | Logic & reactivity | Visual & integration |

## Recommendation

**Use both:**
1. **Vitest** for rapid development and CI - catches most logic bugs quickly
2. **Playwright** for pre-release validation - ensures everything works in real browsers

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Component Documentation

This project uses Storybook to showcase and document each component interactively.

**View components:**
```bash
npm run storybook
```

Then open http://localhost:6006 to browse all components with:
- Live interactive demos
- Prop controls to modify component behavior in real-time
- Auto-generated documentation
- Accessibility testing (a11y addon)

**Build Storybook:**
```bash
npm run build-storybook
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start Storybook
npm run storybook

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **MapLibre GL** - Open-source mapping library
- **Vite** - Build tool and dev server
- **Storybook** - Component development and documentation
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **@vue/test-utils** - Vue component testing utilities
