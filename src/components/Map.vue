<script setup>
import { ref, onMounted, onBeforeUnmount, watch, provide } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps({
  center: {
    type: Array,
    default: () => [-74.5, 40]
  },
  zoom: {
    type: Number,
    default: 16
  },
  style: {
    type: [String, Object],
    default: undefined
  },
  minZoom: {
    type: Number,
    default: 0
  },
  maxZoom: {
    type: Number,
    default: 22
  },
  pitch: {
    type: Number,
    default: 0
  },
  bearing: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['load', 'click', 'move', 'zoom', 'mapInstance']);

const mapContainer = ref(null);
const map = ref(null);

// Provide map instance to child components
provide('map', map);

onMounted(() => {
  // Create a blank style if no style is provided
  const mapStyle = props.style || {
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
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setCenter(newCenter);
  }
});

watch(() => props.zoom, (newZoom) => {
  if (map.value) {
    map.value.setZoom(newZoom);
  }
});

watch(() => props.pitch, (newPitch) => {
  if (map.value) {
    map.value.setPitch(newPitch);
  }
});

watch(() => props.bearing, (newBearing) => {
  if (map.value) {
    map.value.setBearing(newBearing);
  }
});

watch(() => props.style, (newStyle) => {
  if (map.value) {
    map.value.setStyle(newStyle);
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
