import { test, expect } from '@playwright/test'

test.describe('Map + MapLayer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test.html')
  })

  test('should load the map and display it', async ({ page }) => {
    // Wait for the map to load
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Verify the map container exists and is visible
    const mapContainer = page.locator('.map-container')
    await expect(mapContainer).toBeVisible()

    // Verify the MapLibre canvas element exists (rendered by MapLibre)
    const canvas = page.locator('.map-container canvas.maplibregl-canvas')
    await expect(canvas).toBeVisible()
  })

  test('should display initial center coordinates', async ({ page }) => {
    // Check that the initial center is displayed
    await expect(page.locator('#current-center')).toContainText('Center: -74.5, 40')
  })

  test('should update center when button is clicked', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Click the change center button
    await page.click('#change-center-btn')

    // Wait a bit for the update
    await page.waitForTimeout(500)

    // Verify the center text updated
    await expect(page.locator('#current-center')).toContainText('Center: -75, 41')
  })

  test('should render MapLibre controls', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Check that MapLibre GL control container exists in the DOM
    const controlContainer = page.locator('.maplibregl-control-container')
    await expect(controlContainer).toBeAttached()

    // Check that the canvas is visible (which means the map is working)
    const canvas = page.locator('.map-container canvas.maplibregl-canvas')
    await expect(canvas).toBeVisible()
  })

  test('should handle map interactions', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Get the canvas element
    const canvas = page.locator('.map-container canvas.maplibregl-canvas')
    await expect(canvas).toBeVisible()

    // Get canvas bounding box
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()

    // Click on the map canvas (center of the canvas)
    await canvas.click({
      position: {
        x: box.width / 2,
        y: box.height / 2
      }
    })

    // The click should work (we can see console output in browser)
    // In a real scenario, you might check for visible markers or popups
    await page.waitForTimeout(500)
  })

  test('should load OpenStreetMap tiles', async ({ page }) => {
    // Wait for map to load
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Wait a bit for tiles to load
    await page.waitForTimeout(2000)

    // Check that network requests were made to OSM tile server
    // This verifies the MapLayer component is working
    const requests = []
    page.on('request', request => {
      if (request.url().includes('tile.openstreetmap.org')) {
        requests.push(request.url())
      }
    })

    // Reload to capture the requests
    await page.reload()
    await expect(page.locator('#map-status')).toContainText('Map Loaded', { timeout: 10000 })

    // Wait for tiles to load
    await page.waitForTimeout(2000)

    // We should have made requests to OSM
    // Note: This is a simple check; in a real test you might want to be more specific
    const osmRequests = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.includes('tile.openstreetmap.org'))
        .length
    })

    expect(osmRequests).toBeGreaterThan(0)
  })

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('E2E Test Page')
  })

  test('should render control buttons', async ({ page }) => {
    const changeButton = page.locator('#change-center-btn')
    await expect(changeButton).toBeVisible()
    await expect(changeButton).toHaveText('Change Center')
  })
})
