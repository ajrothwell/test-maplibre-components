<script setup>
import { inject, computed, watchEffect } from 'vue';
import maplibregl from 'maplibre-gl';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
});

const map = inject('map');

const positionStyle = computed(() => {
  const positions = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' }
  };
  return positions[props.position];
});

// Add navigation controls
let stopWatch = null;

stopWatch = watchEffect(() => {
  if (!map.value) return;

  // Stop watching once map is available
  if (stopWatch) {
    stopWatch();
    stopWatch = null;
  }

  map.value.addControl(new maplibregl.NavigationControl(), props.position);
});


</script>

<template>
  <slot></slot>
</template>