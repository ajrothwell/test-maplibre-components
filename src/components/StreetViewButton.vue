<script setup>
import { useMapControl, createButtonControl } from '../composables/useMapControl';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  icon: {
    type: String,
    default: 'fa-solid fa-street-view'
  },
  iconSize: {
    type: Number,
    default: 18
  },
  title: {
    type: String,
    default: 'Open Street View'
  },
  useMapCenter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['opened']);

const { map } = useMapControl(props, () =>
  createButtonControl(props.icon, null, props.title, props.iconSize, openStreetView)
);

function openStreetView() {
  if (!map.value) return;

  let lat, lng;

  if (props.useMapCenter) {
    const center = map.value.getCenter();
    lat = center.lat;
    lng = center.lng;
  } else {
    // Could be extended to use a marker position or last click
    const center = map.value.getCenter();
    lat = center.lat;
    lng = center.lng;
  }

  // Open Google Street View in new tab
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  window.open(streetViewUrl, '_blank');

  emit('opened', { lat, lng });
}
</script>

<template>
  <!-- Control is added directly to the map, no template needed -->
</template>

<style>
/* Styles shared with other map button controls */
</style>
