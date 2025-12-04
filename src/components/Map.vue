<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, provide, type Ref } from 'vue';
import maplibregl, { type Map as MapLibreMap, type MapMouseEvent, type LngLatLike, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  center?: LngLatLike;
  zoom?: number;
  style?: string | StyleSpecification;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [-74.5, 40] as LngLatLike,
  zoom: 16,
  style: undefined,
  minZoom: 0,
  maxZoom: 22,
  pitch: 0,
  bearing: 0
});

interface Emits {
  (e: 'load', map: MapLibreMap): void;
  (e: 'click', event: MapMouseEvent): void;
  (e: 'move', data: { center: { lng: number; lat: number }; zoom: number }): void;
  (e: 'zoom', zoom: number): void;
  (e: 'mapInstance', map: MapLibreMap): void;
}

const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLDivElement | null>(null);
const map = ref<MapLibreMap | null>(null);

// Provide map instance to child components
provide('map', map);

onMounted(() => {
  if (!mapContainer.value) return;

  // Create a blank style if no style is provided
  const mapStyle: string | StyleSpecification = props.style || {
    version: 8,
    sources: {},
    layers: []
  };

  // Initialize the map
  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle,
    center: props.center,
    zoom: props.zoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    pitch: props.pitch,
    bearing: props.bearing,
    attributionControl: false
  });

  // Emit map instance to parent
  emit('mapInstance', map.value);

  // Map event listeners
  map.value.on('load', () => {
    emit('load', map.value);
  });

  map.value.on('click', (e) => {
    emit('click', e);
  });

  map.value.on('move', () => {
    emit('move', {
      center: map.value.getCenter(),
      zoom: map.value.getZoom()
    });
  });

  map.value.on('zoom', () => {
    emit('zoom', map.value.getZoom());
  });
});

// Watch for prop changes
watch(() => props.center, (newCenter: LngLatLike | undefined) => {
  if (map.value && newCenter) {
    map.value.setCenter(newCenter);
  }
});

watch(() => props.zoom, (newZoom: number | undefined) => {
  if (map.value && newZoom !== undefined) {
    map.value.setZoom(newZoom);
  }
});

watch(() => props.pitch, (newPitch: number | undefined) => {
  if (map.value && newPitch !== undefined) {
    map.value.setPitch(newPitch);
  }
});

watch(() => props.bearing, (newBearing: number | undefined) => {
  if (map.value && newBearing !== undefined) {
    map.value.setBearing(newBearing);
  }
});

watch(() => props.style, (newStyle: string | StyleSpecification | undefined) => {
  if (map.value && newStyle) {
    map.value.setStyle(newStyle);
  }
});

watch(() => props.minZoom, (newMinZoom: number | undefined) => {
  if (map.value && newMinZoom !== undefined) {
    map.value.setMinZoom(newMinZoom);
  }
});

watch(() => props.maxZoom, (newMaxZoom: number | undefined) => {
  if (map.value && newMaxZoom !== undefined) {
    map.value.setMaxZoom(newMaxZoom);
  }
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Expose map instance for parent component access
defineExpose({
  map
});
</script>

<template>
  <div ref="mapContainer" class="map-container">
    <slot></slot>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
