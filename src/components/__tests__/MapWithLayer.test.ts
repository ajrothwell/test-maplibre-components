import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { nextTick, h } from 'vue'
import Map from '../Map.vue'
import MapLayer from '../MapLayer.vue'

// Create mock map instance with proper typing
const mockMap = {
  on: vi.fn() as Mock,
  once: vi.fn() as Mock,
  remove: vi.fn() as Mock,
  addLayer: vi.fn() as Mock,
  addSource: vi.fn() as Mock,
  getLayer: vi.fn(() => null) as Mock,
  getSource: vi.fn(() => null) as Mock,
  getCenter: vi.fn(() => ({ lng: 0, lat: 0 })) as Mock,
  getZoom: vi.fn(() => 10) as Mock,
  setCenter: vi.fn() as Mock,
  setZoom: vi.fn() as Mock,
  setStyle: vi.fn() as Mock,
  loaded: vi.fn(() => true) as Mock,
  setPaintProperty: vi.fn() as Mock,
  setLayoutProperty: vi.fn() as Mock,
  setFilter: vi.fn() as Mock,
  removeLayer: vi.fn() as Mock,
  removeSource: vi.fn() as Mock,
  setPitch: vi.fn() as Mock,
  setBearing: vi.fn() as Mock,
  setMinZoom: vi.fn() as Mock,
  setMaxZoom: vi.fn() as Mock
}

// Mock maplibre-gl
vi.mock('maplibre-gl', () => ({
  default: {
    Map: class {
      constructor() {
        return mockMap
      }
    }
  }
}))

describe('Map + MapLayer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mount Map component and initialize maplibre', async () => {
    const wrapper = mount(Map, {
      props: {
        center: [-75.0, 40.5],
        zoom: 12
      }
    })

    await nextTick()

    // Verify map instance was created
    expect(wrapper.vm.map).toBeTruthy()
    expect(mockMap.on).toHaveBeenCalled()
  })

  it('should emit load event when map loads', async () => {
    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      }
    })

    await nextTick()

    // Find the load event listener and trigger it
    const loadCall = mockMap.on.mock.calls.find(call => call[0] === 'load')
    expect(loadCall).toBeTruthy()

    // Trigger the load callback
    loadCall[1]()

    await nextTick()

    // Check that the load event was emitted
    expect(wrapper.emitted('load')).toBeTruthy()
  })

  it('should integrate Map and MapLayer components together', async () => {
    // Mount Map with MapLayer as a child (integration test)
    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      },
      slots: {
        default: h(MapLayer, {
          id: 'test-layer',
          type: 'fill',
          source: 'test-source',
          paint: { 'fill-color': '#ff0000' }
        })
      }
    })

    await nextTick()
    await flushPromises()

    // The layer should be added since map.loaded() returns true
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-layer',
        type: 'fill',
        source: 'test-source',
        paint: { 'fill-color': '#ff0000' }
      }),
      undefined
    )
  })

  it('should add layer with inline source definition', async () => {
    const sourceConfig = {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256
    }

    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      },
      slots: {
        default: h(MapLayer, {
          id: 'basemap',
          type: 'raster',
          source: sourceConfig
        })
      }
    })

    await nextTick()
    await flushPromises()

    // Verify source was added
    expect(mockMap.addSource).toHaveBeenCalledWith('basemap', sourceConfig)

    // Verify layer was added
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'basemap',
        type: 'raster',
        source: 'basemap'
      }),
      undefined
    )
  })

  it('should handle map click events', async () => {
    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      }
    })

    await nextTick()

    // Find the click event listener
    const clickCall = mockMap.on.mock.calls.find(call => call[0] === 'click')
    expect(clickCall).toBeTruthy()

    // Trigger a click event
    const clickEvent = { lngLat: { lng: -74.5, lat: 40 } }
    clickCall[1](clickEvent)

    await nextTick()

    // Verify click event was emitted
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0][0]).toEqual(clickEvent)
  })

  it('should update map center when prop changes', async () => {
    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      }
    })

    await nextTick()

    // Update center prop
    await wrapper.setProps({
      center: [-75.0, 41.0]
    })

    await nextTick()

    // Verify setCenter was called with new value
    expect(mockMap.setCenter).toHaveBeenCalledWith([-75.0, 41.0])
  })

  it('should clean up map on unmount', async () => {
    const wrapper = mount(Map, {
      props: {
        center: [-74.5, 40],
        zoom: 16
      }
    })

    await nextTick()

    // Unmount map
    wrapper.unmount()
    await nextTick()

    // Verify map was removed
    expect(mockMap.remove).toHaveBeenCalled()
  })
})
