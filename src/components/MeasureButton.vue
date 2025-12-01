<script setup>
import { ref, watch } from 'vue';
import { useMapControl, createButtonControl } from '../composables/useMapControl';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  icon: {
    type: String,
    default: 'fa-solid fa-ruler'
  },
  iconSize: {
    type: Number,
    default: 18
  },
  title: {
    type: String,
    default: 'Measure Distance'
  },
  unit: {
    type: String,
    default: 'feet',
    validator: (value) => ['feet', 'meters', 'miles', 'kilometers'].includes(value)
  }
});

const emit = defineEmits(['measured', 'cleared']);

const isMeasuring = ref(false);
const measurePoints = ref([]);
const { map } = useMapControl(props, () => {
  const control = createButtonControl(props.icon, null, props.title, props.iconSize, toggleMeasure);
  controlInstance = control;
  return control;
});

let controlInstance = null;
let clickHandler = null;

const sourceId = 'measure-line-source';
const layerId = 'measure-line-layer';
const pointsLayerId = 'measure-points-layer';
const labelsLayerId = 'measure-labels-layer';

function toggleMeasure() {
  isMeasuring.value = !isMeasuring.value;

  if (isMeasuring.value) {
    startMeasuring();
  } else {
    stopMeasuring();
  }
}

function startMeasuring() {
  if (!map.value) return;

  map.value.getCanvas().style.cursor = 'crosshair';

  // Add source and layers
  if (!map.value.getSource(sourceId)) {
    map.value.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    map.value.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#ff0000',
        'line-width': 3
      }
    });

    map.value.addLayer({
      id: pointsLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 5,
        'circle-color': '#ff0000',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    });

    map.value.addLayer({
      id: labelsLayerId,
      type: 'symbol',
      source: sourceId,
      filter: ['==', '$type', 'Point'],
      layout: {
        'text-field': ['get', 'distance'],
        'text-size': 12,
        'text-offset': [0, -1.5],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#ff0000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });
  }

  clickHandler = (e) => {
    measurePoints.value.push({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    updateMeasureLine();
  };

  map.value.on('click', clickHandler);
}

function stopMeasuring() {
  if (!map.value) return;

  map.value.getCanvas().style.cursor = '';

  if (clickHandler) {
    map.value.off('click', clickHandler);
    clickHandler = null;
  }

  // Clear measurements
  if (measurePoints.value.length > 0) {
    emit('cleared');
  }

  measurePoints.value = [];
  updateMeasureLine();
}

function updateMeasureLine() {
  if (!map.value) return;

  const features = [];
  let totalDistance = 0;

  // Add line segments
  if (measurePoints.value.length >= 2) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: measurePoints.value.map(p => [p.lng, p.lat])
      }
    });
  }

  // Add points with distance labels
  measurePoints.value.forEach((point, i) => {
    if (i > 0) {
      const distance = calculateDistance(measurePoints.value[i - 1], point);
      totalDistance += parseFloat(distance);

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: {
          distance: `${convertDistance(distance)} ${getUnitLabel()}`
        }
      });
    } else {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: {
          distance: 'Start'
        }
      });
    }
  });

  const source = map.value.getSource(sourceId);
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features
    });
  }

  if (measurePoints.value.length >= 2) {
    emit('measured', {
      points: measurePoints.value,
      totalDistance: convertDistance(totalDistance.toFixed(2)),
      unit: props.unit
    });
  }
}

function calculateDistance(point1, point2) {
  const R = 6371000; // Earth's radius in meters
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

function convertDistance(meters) {
  const m = parseFloat(meters);
  switch (props.unit) {
    case 'feet':
      return (m * 3.28084).toFixed(2);
    case 'miles':
      return (m * 0.000621371).toFixed(2);
    case 'kilometers':
      return (m / 1000).toFixed(2);
    default:
      return m.toFixed(2);
  }
}

function getUnitLabel() {
  return props.unit === 'feet' ? 'ft' :
         props.unit === 'miles' ? 'mi' :
         props.unit === 'kilometers' ? 'km' : 'm';
}

// Update button style when measuring
watch(isMeasuring, (newValue) => {
  if (controlInstance && controlInstance._button) {
    if (newValue) {
      controlInstance._button.classList.add('active');
    } else {
      controlInstance._button.classList.remove('active');
    }
  }
});
</script>

<template>
  <!-- Control is added directly to the map, no template needed -->
</template>

<style>
/* Styles shared with other map button controls */
</style>
