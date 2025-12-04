<script setup>
import { inject, onBeforeUnmount, watchEffect } from 'vue';

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  icon: {
    type: String,
    default: 'fa-solid fa-location-crosshairs'
  },
  iconSize: {
    type: Number,
    default: 18
  },
  title: {
    type: String,
    default: 'Show my location'
  },
  trackUser: {
    type: Boolean,
    default: false
  },
  showAccuracyCircle: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['located', 'error']);
const map = inject('map');

const handleGeolocation = () => {
  if (!map.value || !navigator.geolocation) {
    emit('error', new Error('Geolocation not supported'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { longitude, latitude, accuracy } = position.coords;

      // Fly to user location
      map.value.flyTo({
        center: [longitude, latitude],
        zoom: 16,
        essential: true
      });

      // Add accuracy circle if enabled
      if (props.showAccuracyCircle) {
        const sourceId = 'geolocation-accuracy';
        const layerId = 'geolocation-accuracy-layer';

        // Remove existing if present
        if (map.value.getLayer(layerId)) {
          map.value.removeLayer(layerId);
        }
        if (map.value.getSource(sourceId)) {
          map.value.removeSource(sourceId);
        }

        // Add accuracy circle
        map.value.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: { accuracy }
          }
        });

        map.value.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': {
              stops: [
                [0, 0],
                [20, accuracy * Math.pow(2, 20 - 16)]
              ],
              base: 2
            },
            'circle-color': '#4285F4',
            'circle-opacity': 0.2,
            'circle-stroke-color': '#4285F4',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 0.8
          }
        });
      }

      emit('located', { longitude, latitude, accuracy });
    },
    (error) => {
      emit('error', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

// Create a MapLibre IControl
class GeolocationControl {
  constructor(icon, title, iconSize, clickHandler) {
    this._icon = icon;
    this._title = title;
    this._iconSize = iconSize;
    this._clickHandler = clickHandler;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    this._button = document.createElement('button');
    this._button.className = 'map-button';
    this._button.type = 'button';
    this._button.title = this._title;
    this._button.onclick = this._clickHandler;

    const iconElement = document.createElement('i');
    iconElement.className = this._icon;
    iconElement.style.fontSize = `${this._iconSize}px`;

    this._button.appendChild(iconElement);
    this._container.appendChild(this._button);

    return this._container;
  }

  onRemove() {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = undefined;
  }
}

let control = null;
let stopWatch = null;

stopWatch = watchEffect(() => {
  if (!map.value) return;

  if (stopWatch) {
    stopWatch();
    stopWatch = null;
  }

  control = new GeolocationControl(props.icon, props.title, props.iconSize, handleGeolocation);
  map.value.addControl(control, props.position);
});

onBeforeUnmount(() => {
  if (map.value && control) {
    try {
      map.value.removeControl(control);
    } catch (error) {
      console.warn('Error removing geolocation control:', error.message);
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
