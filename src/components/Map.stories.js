import Map from './Map.vue'
import MapLayer from './MapLayer.vue'
import { toRefs } from 'vue'

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
    layout: 'centered',
    docs: {
      description: {
        component: 'The Map component is the core container for MapLibre GL maps. It provides a reactive interface for controlling the map view.'
      }
    }
  },
  render: (args) => ({
    components: { Map, MapLayer },
    setup() {
      return { ...toRefs(args) }
    },
    template: `
      <div style="width: 40vw; height: 60vh;">
        <Map
          :center="center"
          :zoom="zoom"
          :pitch="pitch || 0"
          :bearing="bearing || 0"
          :minZoom="minZoom || 0"
          :maxZoom="maxZoom || 22"
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
  })
}

// Default story with basic settings
export const Default = {
  args: {
    center: [-74.5, 40],
    zoom: 16,
    pitch: 0,
    bearing: 0,
    minZoom: 0,
    maxZoom: 22
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic map with OpenStreetMap raster tiles. Use the controls to adjust center, zoom, pitch, and bearing.'
      }
    }
  }
}

// Map with custom center
export const SanFrancisco = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 13,
    pitch: 0,
    bearing: 0
  },
  parameters: {
    docs: {
      description: {
        story: 'Map centered on San Francisco.'
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
  parameters: {
    docs: {
      description: {
        story: 'Map centered on Paris with 45-degree rotation.'
      }
    }
  }
}
