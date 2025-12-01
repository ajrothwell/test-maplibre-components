<script setup>
import { inject, onBeforeUnmount, watch, watchEffect } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['fill', 'line', 'symbol', 'circle', 'fill-extrusion', 'raster', 'background', 'heatmap', 'hillshade'].includes(value)
  },
  source: {
    type: [String, Object],
    required: true
  },
  sourceLayer: {
    type: String,
    default: undefined
  },
  paint: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({})
  },
  filter: {
    type: Array,
    default: undefined
  },
  minzoom: {
    type: Number,
    default: undefined
  },
  maxzoom: {
    type: Number,
    default: undefined
  },
  beforeId: {
    type: String,
    default: undefined
  }
});

const map = inject('map');

const addLayer = () => {
  if (!map.value) return;

  // Add source if it's an object (inline source definition)
  if (typeof props.source === 'object') {
    if (!map.value.getSource(props.id)) {
      map.value.addSource(props.id, props.source);
    }
  }

  // Build layer configuration
  const layerConfig = {
    id: props.id,
    type: props.type,
    source: typeof props.source === 'object' ? props.id : props.source,
    paint: props.paint,
    layout: props.layout
  };

  if (props.sourceLayer) layerConfig['source-layer'] = props.sourceLayer;
  if (props.filter) layerConfig.filter = props.filter;
  if (props.minzoom !== undefined) layerConfig.minzoom = props.minzoom;
  if (props.maxzoom !== undefined) layerConfig.maxzoom = props.maxzoom;

  // Add layer
  if (!map.value.getLayer(props.id)) {
    map.value.addLayer(layerConfig, props.beforeId);
  }
};

const removeLayer = () => {
  if (!map.value) return;

  if (map.value.getLayer(props.id)) {
    map.value.removeLayer(props.id);
  }

  // Remove source if it was added inline
  if (typeof props.source === 'object' && map.value.getSource(props.id)) {
    map.value.removeSource(props.id);
  }
};

let stopWatch = null;

stopWatch = watchEffect(() => {
  if (!map.value) return;

  // Stop watching once map is available
  if (stopWatch) {
    stopWatch();
    stopWatch = null;
  }

  if (map.value.loaded()) {
    addLayer();
  } else {
    map.value.once('load', addLayer);
  }
});

// Watch for paint changes
watch(() => props.paint, (newPaint) => {
  if (map.value && map.value.getLayer(props.id)) {
    Object.keys(newPaint).forEach(key => {
      map.value.setPaintProperty(props.id, key, newPaint[key]);
    });
  }
}, { deep: true });

// Watch for layout changes
watch(() => props.layout, (newLayout) => {
  if (map.value && map.value.getLayer(props.id)) {
    Object.keys(newLayout).forEach(key => {
      map.value.setLayoutProperty(props.id, key, newLayout[key]);
    });
  }
}, { deep: true });

// Watch for filter changes
watch(() => props.filter, (newFilter) => {
  if (map.value && map.value.getLayer(props.id)) {
    map.value.setFilter(props.id, newFilter);
  }
});

onBeforeUnmount(() => {
  removeLayer();
});
</script>

<template>
  <slot></slot>
</template>
