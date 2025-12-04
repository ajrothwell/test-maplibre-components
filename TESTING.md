# Testing Guide

This project includes both unit/integration tests (Vitest) and end-to-end tests (Playwright) for the Map and MapLayer components.

## Unit/Integration Tests (Vitest)

Unit tests use mocked MapLibre GL instances to test component behavior without actual map rendering.

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

### Test Files
- `src/components/__tests__/MapWithLayer.test.js` - Integration tests for Map + MapLayer components

### What's Tested
- Map component initialization
- Event emission (load, click)
- Map + MapLayer integration
- Inline source definitions
- Prop reactivity (center, zoom changes)
- Component cleanup on unmount

## End-to-End Tests (Playwright)

E2E tests run in a real browser with actual MapLibre GL rendering and OpenStreetMap tiles.

### Run Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see the browser)
npm run test:e2e:headed
```

### Test Page
The E2E tests use a dedicated test page: `test.html` which loads `src/TestPage.vue`

Access it during development:
```bash
npm run dev
# Then open http://localhost:5173/test.html
```

### Test Files
- `e2e/map-layer.spec.js` - E2E tests for Map + MapLayer components

### What's Tested
- Map loads and displays correctly
- MapLibre canvas renders
- Initial center coordinates display
- Center updates when button clicked
- MapLibre control container exists
- Map interactions (clicking on canvas)
- OpenStreetMap tiles are loaded
- Page structure and controls

## Configuration Files

### Vitest
- `vite.config.js` - Vitest configuration
  - Environment: `happy-dom`
  - Globals: `true`

### Playwright
- `playwright.config.js` - Playwright configuration
  - Test directory: `./e2e`
  - Base URL: `http://localhost:5173`
  - Browser: Chromium
  - Auto-starts dev server

## Key Differences

### Unit Tests (Vitest)
- **Fast** - No real browser, mocked dependencies
- **Isolated** - Tests specific component logic
- **Mocked MapLibre** - Doesn't test actual map rendering
- **Good for**: Logic, props, events, state management

### E2E Tests (Playwright)
- **Realistic** - Real browser, real MapLibre, real tiles
- **Comprehensive** - Tests the entire user experience
- **Slower** - Requires browser startup and map rendering
- **Good for**: Visual rendering, interactions, integration with real services

## Running Both Test Suites

```bash
# Run unit tests
npm run test:run

# Run E2E tests
npm run test:e2e
```

## CI/CD Considerations

For CI/CD pipelines:

```bash
# Unit tests (fast, run first)
npm run test:run

# E2E tests (slower, run after build)
npm run test:e2e
```

Playwright will automatically install browsers in CI when needed.
