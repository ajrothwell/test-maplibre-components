<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps({
  center: {
    type: Array,
    default: () => [-74.5, 40]
  },
  zoom: {
    type: Number,
    default: 9
  },
  style: {
    type: [String, Object],
    default: 'https://demotiles.maplibre.org/style.json'
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

onMounted(() => {
  // Initialize the map
  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: props.style,
    center: props.center,
    zoom: props.zoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
    pitch: props.pitch,
    bearing: props.bearing
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

  // Add navigation controls
  map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
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

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
