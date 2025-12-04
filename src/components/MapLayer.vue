<script setup lang="ts">
import { inject, onBeforeUnmount, watch, watchEffect, type Ref } from 'vue';
import type { Map as MapLibreMap, SourceSpecification, LayerSpecification, FilterSpecification } from 'maplibre-gl';

type LayerType = 'fill' | 'line' | 'symbol' | 'circle' | 'fill-extrusion' | 'raster' | 'background' | 'heatmap' | 'hillshade';

interface Props {
  id: string;
  type: LayerType;
  source: string | SourceSpecification;
  sourceLayer?: string;
  paint?: Record<string, any>;
  layout?: Record<string, any>;
  filter?: FilterSpecification;
  minzoom?: number;
  maxzoom?: number;
  beforeId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sourceLayer: undefined,
  paint: () => ({}),
  layout: () => ({}),
  filter: undefined,
  minzoom: undefined,
  maxzoom: undefined,
  beforeId: undefined
});

const map = inject<Ref<MapLibreMap | null>>('map');

const addLayer = () => {
  if (!map || !map.value) return;

  // Add source if it's an object (inline source definition)
  if (typeof props.source === 'object') {
    if (!map.value.getSource(props.id)) {
      map.value.addSource(props.id, props.source);
    }
  }

  // Build layer configuration
  const layerConfig: any = {
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
  if (!map || !map.value) return;

  try {
    if (map.value.getLayer && map.value.getLayer(props.id)) {
      map.value.removeLayer(props.id);
    }

    // Remove source if it was added inline
    if (typeof props.source === 'object' && map.value.getSource && map.value.getSource(props.id)) {
      map.value.removeSource(props.id);
    }
  } catch (error) {
    // Ignore errors during hot reload when map is being destroyed
    console.warn('Error removing layer during cleanup:', (error as Error).message);
  }
};

let stopWatch: (() => void) | null = null;

stopWatch = watchEffect(() => {
  if (!map || !map.value) return;

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
watch(() => props.paint, (newPaint: Record<string, any> | undefined) => {
  if (map && map.value && map.value.getLayer(props.id) && newPaint) {
    Object.keys(newPaint).forEach(key => {
      map.value!.setPaintProperty(props.id, key, newPaint[key]);
    });
  }
}, { deep: true });

// Watch for layout changes
watch(() => props.layout, (newLayout: Record<string, any> | undefined) => {
  if (map && map.value && map.value.getLayer(props.id) && newLayout) {
    Object.keys(newLayout).forEach(key => {
      map.value!.setLayoutProperty(props.id, key, newLayout[key]);
    });
  }
}, { deep: true });

// Watch for filter changes
watch(() => props.filter, (newFilter: FilterSpecification | undefined) => {
  if (map && map.value && map.value.getLayer(props.id)) {
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
