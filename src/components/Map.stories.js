import Map from './Map.vue'
import MapLayer from './MapLayer.vue'

export default {
  title: 'MapLibre/Map',
  component: Map,
  tags: ['autodocs'],
  argTypes: {
    center: {
      control: 'object',
      description: 'Map center coordinates [lng, lat]'
    },
    zoom: {
      control: { type: 'range', min: 0, max: 22, step: 0.1 },
      description: 'Map zoom level'
    },
    pitch: {
      control: { type: 'range', min: 0, max: 85, step: 1 },
      description: 'Map pitch (tilt) angle'
    },
    bearing: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Map bearing (rotation) angle'
    },
    minZoom: {
      control: { type: 'range', min: 0, max: 22, step: 1 },
      description: 'Minimum zoom level'
    },
    maxZoom: {
      control: { type: 'range', min: 0, max: 22, step: 1 },
      description: 'Maximum zoom level'
    }
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The Map component is the core container for MapLibre GL maps. It provides a reactive interface for controlling the map view.'
      }
    }
  }
}

// Map with OpenStreetMap raster layer
export const WithRasterLayer = {
  args: {
    center: [-74.5, 40],
    zoom: 16
  },
  render: (args) => ({
    components: { Map, MapLayer },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100vw; height: 100vh;">
        <Map
          :center="args.center"
          :zoom="args.zoom"
        >
          <MapLayer
            id="osm-raster"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256
            }"
          />
        </Map>
      </div>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: 'Map with an OpenStreetMap raster tile layer.'
      }
    }
  }
}

// Map with custom center
export const CustomLocation = {
  args: {
    center: [-122.4194, 37.7749], // San Francisco
    zoom: 13
  },
  render: (args) => ({
    components: { Map, MapLayer },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100vw; height: 100vh;">
        <Map
          :center="args.center"
          :zoom="args.zoom"
        >
          <MapLayer
            id="osm-raster"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256
            }"
          />
        </Map>
      </div>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: 'Map centered on San Francisco with OpenStreetMap tiles.'
      }
    }
  }
}

// Map with tilt (pitch)
export const WithPitch = {
  args: {
    center: [-74.0060, 40.7128], // New York
    zoom: 16,
    pitch: 60,
    bearing: 0
  },
  render: (args) => ({
    components: { Map, MapLayer },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100vw; height: 100vh;">
        <Map
          :center="args.center"
          :zoom="args.zoom"
          :pitch="args.pitch"
          :bearing="args.bearing"
        >
          <MapLayer
            id="osm-raster"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256
            }"
          />
        </Map>
      </div>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: 'Map with 60-degree pitch for a 3D perspective view.'
      }
    }
  }
}

// Map with rotation (bearing)
export const WithRotation = {
  args: {
    center: [2.3522, 48.8566], // Paris
    zoom: 14,
    pitch: 0,
    bearing: 45
  },
  render: (args) => ({
    components: { Map, MapLayer },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 100vw; height: 100vh;">
        <Map
          :center="args.center"
          :zoom="args.zoom"
          :pitch="args.pitch"
          :bearing="args.bearing"
        >
          <MapLayer
            id="osm-raster"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256
            }"
          />
        </Map>
      </div>
    `
  }),
  parameters: {
    docs: {
      description: {
        story: 'Map centered on Paris with 45-degree rotation.'
      }
    }
  }
}
