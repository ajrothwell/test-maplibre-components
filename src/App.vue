<template>
  <div class="app">
    <header>
      <h1>🗺️ MapLibre Vue Demo</h1>
      <p>Interactive map component built with Vue 3 and MapLibre GL JS</p>
    </header>

    <div class="controls">
      <button @click="flyToNewYork">Fly to New York</button>
      <button @click="flyToLondon">Fly to London</button>
      <button @click="flyToTokyo">Fly to Tokyo</button>
      <button @click="addMarker">Add Random Marker</button>
      <button @click="clearMarkers">Clear Markers</button>
    </div>

    <div class="map-wrapper">
      <Map 
        :center="mapCenter"
        :zoom="mapZoom"
        :style="mapStyle"
        @load="onMapLoad"
        @click="onMapClick"
        @move="onMapMove"
        ref="mapRef"
      />
      
      <div class="info-panel" v-if="clickedCoords">
        <strong>Last Click:</strong><br>
        Lat: {{ clickedCoords.lat.toFixed(4) }}<br>
        Lng: {{ clickedCoords.lng.toFixed(4) }}
      </div>

      <div class="info-panel bottom" v-if="currentCenter">
        <strong>Current View:</strong><br>
        Zoom: {{ currentZoom.toFixed(2) }}<br>
        Center: {{ currentCenter.lng.toFixed(4) }}, {{ currentCenter.lat.toFixed(4) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Map from './components/Map.vue';
import maplibregl from 'maplibre-gl';

const mapRef = ref(null);
const mapCenter = ref([-74.5, 40.7]);
const mapZoom = ref(9);
const mapStyle = ref('https://demotiles.maplibre.org/style.json');

const clickedCoords = ref(null);
const currentCenter = ref(null);
const currentZoom = ref(9);
const markers = ref([]);

const onMapLoad = (map) => {
  console.log('Map loaded successfully!', map);
  
  // Add a default marker at the initial center
  const marker = new maplibregl.Marker({ color: '#FF0000' })
    .setLngLat([-74.5, 40.7])
    .setPopup(new maplibregl.Popup().setHTML('<h3>Welcome!</h3><p>This is New York area</p>'))
    .addTo(map);
  
  markers.value.push(marker);
};

const onMapClick = (e) => {
  clickedCoords.value = e.lngLat;
  console.log('Clicked at:', e.lngLat);
};

const onMapMove = (data) => {
  currentCenter.value = data.center;
  currentZoom.value = data.zoom;
};

const flyToNewYork = () => {
  if (mapRef.value && mapRef.value.map) {
    mapRef.value.map.flyTo({
      center: [-74.006, 40.7128],
      zoom: 11,
      duration: 2000
    });
  }
};

const flyToLondon = () => {
  if (mapRef.value && mapRef.value.map) {
    mapRef.value.map.flyTo({
      center: [-0.1278, 51.5074],
      zoom: 11,
      duration: 2000
    });
  }
};

const flyToTokyo = () => {
  if (mapRef.value && mapRef.value.map) {
    mapRef.value.map.flyTo({
      center: [139.6917, 35.6895],
      zoom: 11,
      duration: 2000
    });
  }
};

const addMarker = () => {
  if (mapRef.value && mapRef.value.map) {
    const map = mapRef.value.map;
    const center = map.getCenter();
    
    // Random offset
    const lng = center.lng + (Math.random() - 0.5) * 0.1;
    const lat = center.lat + (Math.random() - 0.5) * 0.1;
    
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const marker = new maplibregl.Marker({ color: randomColor })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup().setHTML(`<p>Random marker #${markers.value.length + 1}</p>`))
      .addTo(map);
    
    markers.value.push(marker);
  }
};

const clearMarkers = () => {
  markers.value.forEach(marker => marker.remove());
  markers.value = [];
};
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.controls button {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.controls button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  font-size: 0.9rem;
  z-index: 1;
  min-width: 200px;
}

.info-panel.bottom {
  top: auto;
  bottom: 10px;
}

.info-panel strong {
  color: #667eea;
  display: block;
  margin-bottom: 0.5rem;
}
</style>
