<script setup>
import { inject, onBeforeUnmount, watchEffect } from 'vue';
import maplibregl from 'maplibre-gl';

const props = defineProps({
  lngLat: {
    type: Array,
    required: true,
    validator: (value) => value.length === 2 && value.every(v => typeof v === 'number')
  },
  color: {
    type: String,
    default: '#FF0000'
  },
  popup: {
    type: String,
    default: undefined
  },
  draggable: {
    type: Boolean,
    default: false
  },
  rotation: {
    type: Number,
    default: 0
  },
  offset: {
    type: Array,
    default: undefined
  },
  icon: {
    type: String,
    default: undefined
  },
  iconSize: {
    type: Number,
    default: 24
  },
  iconColor: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits(['dragstart', 'drag', 'dragend']);

const map = inject('map');
let marker = null;

const addMarker = () => {
  if (!map.value) return;

  let markerElement = null;

  // Create custom marker element if icon is specified
  if (props.icon) {
    markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `<i class="${props.icon}" style="font-size: ${props.iconSize}px; color: ${props.iconColor || props.color};"></i>`;
  }

  const markerOptions = {
    draggable: props.draggable
  };

  // Add element if custom icon, otherwise use default with color
  if (markerElement) {
    markerOptions.element = markerElement;
  } else {
    markerOptions.color = props.color;
  }

  if (props.rotation) markerOptions.rotation = props.rotation;
  if (props.offset) markerOptions.offset = props.offset;

  marker = new maplibregl.Marker(markerOptions)
    .setLngLat(props.lngLat);

  if (props.popup) {
    const popup = new maplibregl.Popup().setHTML(props.popup);
    marker.setPopup(popup);
  }

  marker.addTo(map.value);

  // Add drag event listeners
  if (props.draggable) {
    marker.on('dragstart', () => emit('dragstart', marker.getLngLat()));
    marker.on('drag', () => emit('drag', marker.getLngLat()));
    marker.on('dragend', () => emit('dragend', marker.getLngLat()));
  }
};

const removeMarker = () => {
  if (marker) {
    marker.remove();
    marker = null;
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

  // Wait for both the map to load and the style to be loaded
  if (map.value.loaded() && map.value.isStyleLoaded()) {
    addMarker();
  } else if (map.value.loaded()) {
    map.value.once('styledata', addMarker);
  } else {
    map.value.once('load', () => {
      if (map.value.isStyleLoaded()) {
        addMarker();
      } else {
        map.value.once('styledata', addMarker);
      }
    });
  }
});

onBeforeUnmount(() => {
  removeMarker();
});
</script>

<template>
  <slot></slot>
</template>
