# MapLibre Vue Components - Usage Examples

## Basic Map Setup

```vue
<script setup>
import { ref } from 'vue';
import { Map, MapLayer } from './components';

const center = ref([-75.1652, 39.9526]); // Philadelphia
const zoom = ref(14);

const handleMapLoad = (map) => {
  console.log('Map loaded!', map);
};
</script>

<template>
  <Map 
    :center="center" 
    :zoom="zoom" 
    @load="handleMapLoad"
    style="width: 100%; height: 100vh;"
  >
    <!-- Your layers and controls here -->
  </Map>
</template>
```

## Drawing Polygons

```vue
<script setup>
import { Map, DrawTool } from './components';

const handlePolygonComplete = (geojson) => {
  console.log('New polygon:', geojson);
  // Save to database
  await savePolygon(geojson);
};
</script>

<template>
  <Map :center="[-75.165, 39.952]" :zoom="14">
    <DrawTool 
      position="bottom-right"
      @polygonComplete="handlePolygonComplete"
    />
  </Map>
</template>
```

## Multiple Basemaps

```vue
<script setup>
import { ref } from 'vue';
import { Map, MapLayer, ImageryToggleButton } from './components';
import imageryIcon from './assets/imagery.png';

const showImagery = ref(false);
</script>

<template>
  <Map :center="[-75.165, 39.952]" :zoom="14">
    <!-- Street basemap -->
    <MapLayer
      id="streets"
      type="raster"
      :source="{
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256
      }"
    />
    
    <!-- Imagery toggle -->
    <ImageryToggleButton
      :iconImage="imageryIcon"
      baseLayerId="streets"
      @toggled="showImagery = $event"
    />
  </Map>
</template>
```

## Location-Based Features

```vue
<script setup>
import { ref } from 'vue';
import { Map, GeolocationButton, MapMarker } from './components';

const userLocation = ref(null);

const handleLocation = ({ longitude, latitude }) => {
  userLocation.value = [longitude, latitude];
};
</script>

<template>
  <Map :center="[-75.165, 39.952]" :zoom="14">
    <GeolocationButton
      position="top-left"
      @located="handleLocation"
    />
    
    <MapMarker
      v-if="userLocation"
      :lngLat="userLocation"
      icon="fa-solid fa-user"
      iconColor="#4285F4"
      popup="<strong>You are here</strong>"
    />
  </Map>
</template>
```

## Measuring Tool

```vue
<script setup>
import { ref } from 'vue';
import { Map, MeasureButton } from './components';

const measurements = ref([]);

const handleMeasured = (data) => {
  measurements.value.push(data);
  console.log(`Total: ${data.totalDistance} ${data.unit}`);
};
</script>

<template>
  <div>
    <Map :center="[-75.165, 39.952]" :zoom="14">
      <MeasureButton
        unit="feet"
        @measured="handleMeasured"
      />
    </Map>
    
    <div class="sidebar">
      <h3>Measurements</h3>
      <div v-for="(m, i) in measurements" :key="i">
        Measurement {{i + 1}}: {{m.totalDistance}} {{m.unit}}
      </div>
    </div>
  </div>
</template>
```

## Custom Button Component

```vue
<script setup>
import { MapButton } from './components';

const exportMapData = () => {
  // Your export logic
  console.log('Exporting map data...');
};
</script>

<template>
  <Map :center="[-75.165, 39.952]" :zoom="14">
    <MapButton
      icon="fa-solid fa-download"
      position="top-right"
      title="Export Data"
      @click="exportMapData"
    />
  </Map>
</template>
```

## Building Your Own Control

```vue
<script setup>
import { ref } from 'vue';
import { useMapControl, createButtonControl } from './composables/useMapControl';

const props = defineProps({
  position: { type: String, default: 'top-right' }
});

const isActive = ref(false);

const { map } = useMapControl(props, () =>
  createButtonControl(
    'fa-solid fa-filter',
    null,
    'Toggle Filter',
    18,
    toggleFilter
  )
);

function toggleFilter() {
  isActive.value = !isActive.value;
  
  // Apply filter to a layer
  if (map.value.getLayer('my-layer')) {
    map.value.setFilter('my-layer', 
      isActive.value ? ['==', 'type', 'important'] : null
    );
  }
}
</script>

<template>
  <!-- Control added automatically -->
</template>
```

## Complete Application Example

```vue
<script setup>
import { ref } from 'vue';
import {
  Map,
  MapLayer,
  MapMarker,
  MapNavigationControl,
  DrawTool,
  GeolocationButton,
  ImageryToggleButton,
  StreetViewButton,
  MeasureButton
} from './components';
import imageryIcon from './assets/imagery.png';

const center = ref([-75.1652, 39.9526]);
const zoom = ref(14);
const markers = ref([
  { lngLat: [-75.1652, 39.9526], label: 'City Hall' },
  { lngLat: [-75.1650, 39.9530], label: 'Liberty Bell' }
]);

const savePolygon = async (geojson) => {
  console.log('Saving polygon:', geojson);
  // await fetch('/api/polygons', { method: 'POST', body: JSON.stringify(geojson) });
};
</script>

<template>
  <div class="app">
    <Map
      :center="center"
      :zoom="zoom"
      @load="map => console.log('Map ready!', map)"
      style="height: 100vh;"
    >
      <!-- Basemap -->
      <MapLayer
        id="basemap"
        type="raster"
        :source="{
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256
        }"
      />
      
      <!-- Markers -->
      <MapMarker
        v-for="(marker, i) in markers"
        :key="i"
        :lngLat="marker.lngLat"
        icon="fa-solid fa-location-dot"
        iconColor="#e74c3c"
        :popup="`<strong>${marker.label}</strong>`"
      />
      
      <!-- Controls -->
      <MapNavigationControl position="bottom-left" />
      <GeolocationButton position="top-left" />
      <ImageryToggleButton :iconImage="imageryIcon" position="top-right" />
      <StreetViewButton position="top-right" />
      <MeasureButton unit="feet" position="top-right" />
      <DrawTool position="bottom-right" @polygonComplete="savePolygon" />
    </Map>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
```
