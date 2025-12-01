<script setup>
import { ref } from 'vue';
import Map from './components/Map.vue';
import MapLayer from './components/MapLayer.vue';
import MapMarker from './components/MapMarker.vue';
import MapButton from './components/MapButton.vue';
import DrawTool from './components/DrawTool.vue';
import MapNavigationControl from './components/MapNavigationControl.vue';
import imageryIcon from './assets/images/imagery_small.png';

const mapCenter = ref([-75.1652, 39.9526]);
const mapZoom = ref(16);

const clickedCoords = ref(null);
const currentCenter = ref(null);
const currentZoom = ref(9);

const onMapLoad = (map) => {
  console.log('Map loaded successfully!', map);
};

const onMapClick = (e) => {
  clickedCoords.value = e.lngLat;
  console.log('Clicked at:', e.lngLat);
};

const onMapMove = (data) => {
  // console.log('Map moved. New center:', data.center, 'New zoom:', data.zoom);
  currentCenter.value = data.center;
  currentZoom.value = data.zoom;
};

const onStreetViewClick = () => {
  console.log('Street View button clicked');
};

const onTargetClick = () => {
  console.log('Target button clicked');
};

</script>

<template>
  <div class="app">
    <header>
      <h1>MapLibre Vue Demo</h1>
    </header>

    <div class="content">
      <div class="map-wrapper">
        <Map
          :center="mapCenter"
          :zoom="mapZoom"
          @load="onMapLoad"
          @click="onMapClick"
          @move="onMapMove"
        >
          <MapNavigationControl position="bottom-left" />
          <MapLayer
            id="arcgis-basemap"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256
            }"
          />
          <MapLayer
            id="arcgis-labels"
            type="raster"
            :source="{
              type: 'raster',
              tiles: ['https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256
            }"
          />
          <MapLayer
            id="polygon-layer"
            type="fill"
            :source="{
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-75.1604584292295, 39.9518650981126],
                    [-75.1605218078484, 39.9515794078712],
                    [-75.1605568434826, 39.9514228459539],
                    [-75.1605725222228, 39.9513519636303],
                    [-75.1614653081383, 39.9514694472814],
                    [-75.1613505586104, 39.9519836083619],
                    [-75.1604584292295, 39.9518650981126]
                  ]]
                }
              }
            }"
            :paint="{
              'fill-color': '#088',
              'fill-opacity': 0.5
            }"
          />
          <MapMarker
            :lngLat="[-75.1652, 39.9526]"
            color="#FF0000"
            popup="<h3>Welcome!</h3><p>This is Philadelphia</p>"
          />
          <MapMarker
            :lngLat="[-75.1650, 39.9530]"
            icon="fa-solid fa-camera"
            iconSize="28"
            iconColor="#2563eb"
            popup="<h3>Camera Location</h3><p>Photo spot</p>"
          />
          <MapButton
            :image="imageryIcon"
            position="top-right"
            title="Imagery"
            @click="onImageryClick"
          />
          <MapButton
            icon="fa-solid fa-street-view"
            position="top-right"
            title="Street View"
            @click="onStreetViewClick"
          />
          <MapButton
            icon="fa-solid fa-circle-dot"
            position="bottom-left"
            title="Target"
            @click="onTargetClick"
          />
          <DrawTool
            position="bottom-right"
          />
        </Map>
      </div>
      <div class="sidebar"></div>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  background: #0f4d90;
  color: white;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.map-wrapper {
  width: 50%;
  position: relative;
  overflow: hidden;
}

.sidebar {
  width: 50%;
  background: #f8f9fa;
}
</style>
