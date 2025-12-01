<script setup>
import { ref } from 'vue';
import { useMapControl, createButtonControl } from '../composables/useMapControl';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  imageryUrl: {
    type: String,
    default: 'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2024_1in/MapServer/tile/{z}/{y}/{x}'
  },
  imageryLabelsUrl: {
    type: String,
    default: 'https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer/tile/{z}/{y}/{x}'
  },
  imageryLayerId: {
    type: String,
    default: 'imagery-layer'
  },
  imageryLabelsLayerId: {
    type: String,
    default: 'imagery-labels-layer'
  },
  baseLayerId: {
    type: String,
    default: null
  },
  iconImage: {
    type: String,
    default: null
  },
  basemapImage: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: 'Toggle Imagery'
  },
  iconSize: {
    type: Number,
    default: 18
  }
});

const emit = defineEmits(['toggled']);

const isImageryVisible = ref(false);
let controlInstance = null;

const { map } = useMapControl(props, () => {
  const control = createButtonControl(null, props.iconImage, props.title, props.iconSize, toggleImagery);
  controlInstance = control;
  return control;
});

function toggleImagery() {
  if (!map.value) return;

  isImageryVisible.value = !isImageryVisible.value;

  if (isImageryVisible.value) {
    // Update button image to show basemap icon
    if (controlInstance && controlInstance._button && props.basemapImage) {
      controlInstance._button.style.backgroundImage = `url("${props.basemapImage}")`;
    }

    // Hide the base labels layer if specified
    if (props.baseLayerId && map.value.getLayer(props.baseLayerId)) {
      map.value.setLayoutProperty(props.baseLayerId, 'visibility', 'none');
    }

    // Add imagery layer if it doesn't exist
    if (!map.value.getSource(props.imageryLayerId)) {
      map.value.addSource(props.imageryLayerId, {
        type: 'raster',
        tiles: [props.imageryUrl],
        tileSize: 256
      });
    }

    if (!map.value.getLayer(props.imageryLayerId)) {
      // Add before base layer if specified, otherwise add at bottom
      map.value.addLayer(
        {
          id: props.imageryLayerId,
          type: 'raster',
          source: props.imageryLayerId
        },
        props.baseLayerId || undefined
      );
    } else {
      map.value.setLayoutProperty(props.imageryLayerId, 'visibility', 'visible');
    }

    // Add imagery labels layer if it doesn't exist
    if (!map.value.getSource(props.imageryLabelsLayerId)) {
      map.value.addSource(props.imageryLabelsLayerId, {
        type: 'raster',
        tiles: [props.imageryLabelsUrl],
        tileSize: 256
      });
    }

    if (!map.value.getLayer(props.imageryLabelsLayerId)) {
      // Add labels layer on top (no beforeId parameter)
      map.value.addLayer({
        id: props.imageryLabelsLayerId,
        type: 'raster',
        source: props.imageryLabelsLayerId
      });
    } else {
      map.value.setLayoutProperty(props.imageryLabelsLayerId, 'visibility', 'visible');
    }
  } else {
    // Update button image back to imagery icon
    if (controlInstance && controlInstance._button && props.iconImage) {
      controlInstance._button.style.backgroundImage = `url("${props.iconImage}")`;
    }

    // Hide imagery layer
    if (map.value.getLayer(props.imageryLayerId)) {
      map.value.setLayoutProperty(props.imageryLayerId, 'visibility', 'none');
    }

    // Hide imagery labels layer
    if (map.value.getLayer(props.imageryLabelsLayerId)) {
      map.value.setLayoutProperty(props.imageryLabelsLayerId, 'visibility', 'none');
    }

    // Show the base labels layer again if specified
    if (props.baseLayerId && map.value.getLayer(props.baseLayerId)) {
      map.value.setLayoutProperty(props.baseLayerId, 'visibility', 'visible');
    }
  }

  emit('toggled', isImageryVisible.value);
}
</script>

<template>
  <!-- Control is added directly to the map, no template needed -->
</template>

<style>
/* Styles shared with other map button controls */
</style>
