<script setup lang="ts">
import { ref } from 'vue'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import Map from './components/Map.vue'
import MapLayer from './components/MapLayer.vue'

const center = ref<[number, number]>([-74.5, 40])
const zoom = ref<number>(16)
const mapInstance = ref<MapLibreMap | null>(null)

const handleMapLoad = (map: MapLibreMap) => {
  console.log('Map loaded!')
  mapInstance.value = map
}

const handleMapClick = (e: MapMouseEvent) => {
  console.log('Map clicked at:', e.lngLat)
}

const changeCenter = () => {
  center.value = [-75.0, 41.0]
}
</script>

<template>
  <div class="test-page">
    <div class="controls">
      <h1>Map + MapLayer E2E Test Page</h1>
      <button
        id="change-center-btn"
        @click="changeCenter"
      >
        Change Center
      </button>
      <div id="map-status">
        <span v-if="mapInstance">Map Loaded</span>
        <span v-else>Map Loading...</span>
      </div>
      <div id="current-center">
        Center: {{ center[0] }}, {{ center[1] }}
      </div>
    </div>

    <Map
      :center="center"
      :zoom="zoom"
      @load="handleMapLoad"
      @click="handleMapClick"
      class="map-container"
    >
      <MapLayer
        id="basemap"
        type="raster"
        :source="{
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256
        }"
      />
    </Map>
  </div>
</template>

<style scoped>
.test-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.controls {
  padding: 20px;
  background: #f0f0f0;
  border-bottom: 2px solid #ccc;
}

.controls h1 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.controls button {
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
}

#map-status {
  margin-top: 10px;
  font-weight: bold;
}

#current-center {
  margin-top: 5px;
  color: #666;
}

.map-container {
  flex: 1;
  position: relative;
}
</style>
