# MapLibre Vue Components Library

A collection of reusable Vue 3 components for building MapLibre GL JS applications with declarative, Vue-friendly syntax.

## Features

- 🗺️ **Declarative Map Components** - Use Vue components instead of imperative MapLibre API calls
- 🎨 **Fully Typed** - Built with Vue 3 Composition API
- 🔌 **Self-Contained** - Components handle their own logic and state
- 🎯 **MapLibre Controls** - Properly integrated with MapLibre's control system
- 📦 **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install maplibre-gl vue
npm install @fortawesome/fontawesome-free  # For icon support
```

## Quick Start

```vue
<script setup>
import { ref } from 'vue';
import Map from './components/Map.vue';
import MapLayer from './components/MapLayer.vue';
import DrawTool from './components/DrawTool.vue';

const center = ref([-75.1652, 39.9526]);
const zoom = ref(14);
</script>

<template>
  <Map :center="center" :zoom="zoom" style="height: 100vh;">
    <MapLayer
      id="basemap"
      type="raster"
      :source="{
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256
      }"
    />
    <DrawTool position="top-right" />
  </Map>
</template>
```

## Core Components

### Map

The root map component that provides the MapLibre instance to all child components.

**Props:**
- `center` (Array): `[longitude, latitude]` - Initial map center
- `zoom` (Number): Initial zoom level (default: 9)
- `style` (String|Object): MapLibre style object or URL (default: blank style)

**Events:**
- `@load` - Emitted when map is loaded with map instance
- `@click` - Emitted on map click with event object
- `@move` - Emitted on map move with `{ center, zoom }`

**Example:**
```vue
<Map
  :center="[-75.1652, 39.9526]"
  :zoom="14"
  @load="onMapLoad"
  @click="onMapClick"
  @move="onMapMove"
>
  <!-- Map child components here -->
</Map>
```

### MapLayer

Declarative layer component for adding data layers to the map.

**Props:**
- `id` (String, required): Unique layer ID
- `type` (String, required): Layer type ('fill', 'line', 'circle', 'symbol', 'raster', etc.)
- `source` (String|Object, required): Source ID or inline source definition
- `paint` (Object): Paint properties
- `layout` (Object): Layout properties
- `beforeId` (String): ID of layer to insert this layer before

**Example:**
```vue
<MapLayer
  id="buildings"
  type="fill"
  :source="{
    type: 'geojson',
    data: buildingsGeoJSON
  }"
  :paint="{
    'fill-color': '#088',
    'fill-opacity': 0.5
  }"
/>
```

See full documentation in COMPONENTS.md for all available components including:
- DrawTool
- GeolocationButton
- ImageryToggleButton
- StreetViewButton
- MeasureButton
- MapButton
- MapMarker
- MapNavigationControl

## License

MIT
