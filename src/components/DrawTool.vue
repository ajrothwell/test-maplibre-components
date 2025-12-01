<script setup>
import { computed, inject, ref, onBeforeUnmount, watchEffect } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    default: 'fa-solid fa-draw-polygon'
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  title: {
    type: String,
    default: 'Draw Tool'
  },
  iconSize: {
    type: Number,
    default: 18
  }
});

const emit = defineEmits(['polygonComplete']);

const map = inject('map');
const isDrawing = ref(false);
const drawingPoints = ref([]);
const completedPolygons = ref([]);
const activePolygonId = ref(null);
const drawSourceId = 'drawing-polygon-source';
const drawLayerId = 'drawing-polygon-layer';
const drawLineLayerId = 'drawing-polygon-line-layer';
const drawPointsSourceId = 'drawing-points-source';
const drawPointsLayerId = 'drawing-points-layer';
const completedPolygonsSourceId = 'completed-polygons-source';
const completedPolygonsLayerId = 'completed-polygons-layer';
const completedPolygonsLineLayerId = 'completed-polygons-line-layer';
const completedPolygonsPointsLayerId = 'completed-polygons-points-layer';

let mapClickHandler = null;
let polygonClickHandler = null;

// Calculate distance between two points in feet
const calculateDistance = (point1, point2) => {
  const R = 6371000; // Earth's radius in meters
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const meters = R * c;
  const feet = meters * 3.28084;
  return feet.toFixed(2);
};

const updateDrawingPolygon = () => {
  if (!map.value || drawingPoints.value.length === 0) return;

  const coordinates = drawingPoints.value.map(p => [p.lng, p.lat]);

  // Close the polygon if we have at least 3 points
  if (coordinates.length >= 3) {
    coordinates.push(coordinates[0]);
  }

  const geojson = {
    type: 'Feature',
    geometry: {
      type: coordinates.length >= 3 ? 'Polygon' : 'LineString',
      coordinates: coordinates.length >= 3 ? [coordinates] : coordinates
    }
  };

  const source = map.value.getSource(drawSourceId);
  if (source) {
    source.setData(geojson);
  }

  // Update points layer
  const pointsGeojson = {
    type: 'FeatureCollection',
    features: drawingPoints.value.map((point, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      },
      properties: {
        index: index
      }
    }))
  };

  const pointsSource = map.value.getSource(drawPointsSourceId);
  if (pointsSource) {
    pointsSource.setData(pointsGeojson);
  }
};

const updateCompletedPolygons = () => {
  if (!map.value) return;

  const features = completedPolygons.value.map((polygon) => ({
    type: 'Feature',
    id: polygon.id,
    geometry: {
      type: 'Polygon',
      coordinates: [polygon.coordinates]
    },
    properties: {
      id: polygon.id,
      active: polygon.id === activePolygonId.value
    }
  }));

  const source = map.value.getSource(completedPolygonsSourceId);
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: features
    });
  }

  // Update points
  const pointFeatures = completedPolygons.value.flatMap((polygon) =>
    polygon.points.map((point, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      },
      properties: {
        polygonId: polygon.id,
        index: index,
        active: polygon.id === activePolygonId.value
      }
    }))
  );

  const pointsSource = map.value.getSource(completedPolygonsPointsLayerId);
  if (pointsSource) {
    pointsSource.setData({
      type: 'FeatureCollection',
      features: pointFeatures
    });
  }
};

const completePolygon = () => {
  if (drawingPoints.value.length >= 3) {
    const coordinates = drawingPoints.value.map(p => [p.lng, p.lat]);
    coordinates.push(coordinates[0]); // Close the polygon

    const polygonId = `polygon-${Date.now()}`;

    completedPolygons.value.push({
      id: polygonId,
      coordinates: coordinates,
      points: [...drawingPoints.value]
    });

    // Set as active (orange) when completed
    activePolygonId.value = polygonId;

    // Update completed polygons display
    updateCompletedPolygons();

    emit('polygonComplete', {
      type: 'Polygon',
      coordinates: [coordinates]
    });
  }

  // Clean up drawing layers
  cleanupDrawing();
  isDrawing.value = false;
  map.value.getCanvas().style.cursor = '';
};

const cleanupDrawing = () => {
  if (!map.value) return;

  // Remove click handler
  if (mapClickHandler) {
    map.value.off('click', mapClickHandler);
    mapClickHandler = null;
  }

  // Remove layers and source
  if (map.value.getLayer(drawPointsLayerId)) {
    map.value.removeLayer(drawPointsLayerId);
  }
  if (map.value.getLayer(drawLineLayerId)) {
    map.value.removeLayer(drawLineLayerId);
  }
  if (map.value.getLayer(drawLayerId)) {
    map.value.removeLayer(drawLayerId);
  }
  if (map.value.getSource(drawPointsSourceId)) {
    map.value.removeSource(drawPointsSourceId);
  }
  if (map.value.getSource(drawSourceId)) {
    map.value.removeSource(drawSourceId);
  }

  drawingPoints.value = [];
};

const setupCompletedPolygonsLayers = () => {
  if (!map.value) return;

  // Add source for completed polygons
  if (!map.value.getSource(completedPolygonsSourceId)) {
    map.value.addSource(completedPolygonsSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  }

  // Add fill layer
  if (!map.value.getLayer(completedPolygonsLayerId)) {
    map.value.addLayer({
      id: completedPolygonsLayerId,
      type: 'fill',
      source: completedPolygonsSourceId,
      paint: {
        'fill-color': [
          'case',
          ['get', 'active'],
          '#ff8c00', // orange for active
          '#088'     // teal for inactive
        ],
        'fill-opacity': 0.4
      }
    });
  }

  // Add line layer
  if (!map.value.getLayer(completedPolygonsLineLayerId)) {
    map.value.addLayer({
      id: completedPolygonsLineLayerId,
      type: 'line',
      source: completedPolygonsSourceId,
      paint: {
        'line-color': [
          'case',
          ['get', 'active'],
          '#ff8c00', // orange for active
          '#088'     // teal for inactive
        ],
        'line-width': 2
      }
    });
  }

  // Add points source
  if (!map.value.getSource(completedPolygonsPointsLayerId)) {
    map.value.addSource(completedPolygonsPointsLayerId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  }

  // Add points layer
  if (!map.value.getLayer(completedPolygonsPointsLayerId)) {
    map.value.addLayer({
      id: completedPolygonsPointsLayerId,
      type: 'circle',
      source: completedPolygonsPointsLayerId,
      paint: {
        'circle-radius': 5,
        'circle-color': [
          'case',
          ['get', 'active'],
          '#ff8c00', // orange for active
          '#088'     // teal for inactive
        ],
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    });
  }

  // Add click handler for polygons
  polygonClickHandler = (e) => {
    const features = map.value.queryRenderedFeatures(e.point, {
      layers: [completedPolygonsLayerId]
    });

    if (features.length > 0) {
      const clickedPolygonId = features[0].properties.id;
      activePolygonId.value = clickedPolygonId;
      updateCompletedPolygons();
    } else if (!isDrawing.value) {
      // Clicked elsewhere, deactivate all
      activePolygonId.value = null;
      updateCompletedPolygons();
    }
  };

  map.value.on('click', polygonClickHandler);
};

const handleClick = () => {
  if (!map.value) return;

  isDrawing.value = !isDrawing.value;

  if (isDrawing.value) {
    // Keep any active polygon active when starting to draw
    // activePolygonId remains unchanged

    // Enable draw mode
    map.value.getCanvas().style.cursor = 'crosshair';
    drawingPoints.value = [];

    // Add source and layer for drawing
    if (!map.value.getSource(drawSourceId)) {
      map.value.addSource(drawSourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
    }

    if (!map.value.getLayer(drawLayerId)) {
      map.value.addLayer({
        id: drawLayerId,
        type: 'fill',
        source: drawSourceId,
        paint: {
          'fill-color': '#ff8c00',
          'fill-opacity': 0.4
        }
      });
    }

    if (!map.value.getLayer(drawLineLayerId)) {
      map.value.addLayer({
        id: drawLineLayerId,
        type: 'line',
        source: drawSourceId,
        paint: {
          'line-color': '#ff8c00',
          'line-width': 2
        }
      });
    }

    // Add source and layer for vertex points
    if (!map.value.getSource(drawPointsSourceId)) {
      map.value.addSource(drawPointsSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    if (!map.value.getLayer(drawPointsLayerId)) {
      map.value.addLayer({
        id: drawPointsLayerId,
        type: 'circle',
        source: drawPointsSourceId,
        paint: {
          'circle-radius': 5,
          'circle-color': '#ff8c00',
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2
        }
      });
    }

    // Add click handler
    mapClickHandler = (e) => {
      // Check if clicking on the first point to close polygon
      if (drawingPoints.value.length >= 3) {
        const firstPoint = drawingPoints.value[0];
        const clickPoint = e.lngLat;

        // Calculate distance in pixels
        const firstPointPixel = map.value.project([firstPoint.lng, firstPoint.lat]);
        const clickPointPixel = map.value.project([clickPoint.lng, clickPoint.lat]);
        const distance = Math.sqrt(
          Math.pow(firstPointPixel.x - clickPointPixel.x, 2) +
          Math.pow(firstPointPixel.y - clickPointPixel.y, 2)
        );

        // If click is within 10 pixels of first point, complete the polygon
        if (distance < 10) {
          completePolygon();
          return;
        }
      }

      // Add the clicked point
      drawingPoints.value.push(e.lngLat);
      updateDrawingPolygon();
    };

    map.value.on('click', mapClickHandler);
  } else {
    // Disable draw mode
    cleanupDrawing();
    map.value.getCanvas().style.cursor = '';
  }
};

const positionStyle = computed(() => {
  const positions = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' }
  };
  return positions[props.position];
});

const iconStyle = computed(() => ({
  fontSize: `${props.iconSize}px`
}));

// Get the active polygon object
const getActivePolygon = () => {
  if (activePolygonId.value === null) return null;
  return completedPolygons.value.find(p => p.id === activePolygonId.value);
};

// Get points to display in the table
const getDisplayPoints = () => {
  if (isDrawing.value && drawingPoints.value.length > 0) {
    return drawingPoints.value;
  }
  const activePolygon = getActivePolygon();
  return activePolygon ? activePolygon.points : [];
};

// Setup drawing layers when map is ready
let stopWatch = null;
stopWatch = watchEffect(() => {
  if (!map.value) return;

  if (stopWatch) {
    stopWatch();
    stopWatch = null;
  }

  // Wait for map to load before setting up layers
  if (map.value.loaded()) {
    setupCompletedPolygonsLayers();
  } else {
    map.value.once('load', () => {
      setupCompletedPolygonsLayers();
    });
  }
});

onBeforeUnmount(() => {
  cleanupDrawing();

  // Remove polygon click handler
  if (map.value && polygonClickHandler) {
    map.value.off('click', polygonClickHandler);
  }
});
</script>

<template>
  <div class="draw-tool-wrapper" :style="positionStyle">
    <div v-if="(isDrawing && drawingPoints.length > 0) || (activePolygonId !== null && getActivePolygon())" class="vertices-table">
      <table>
        <thead>
          <tr>
            <th>Lat</th>
            <th>Lng</th>
            <th>Distance (ft)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(point, index) in getDisplayPoints()" :key="index">
            <td>{{ point.lat.toFixed(6) }}</td>
            <td>{{ point.lng.toFixed(6) }}</td>
            <td>
              {{ index === 0 ? '-' : calculateDistance(getDisplayPoints()[index - 1], point) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      class="draw-tool-button"
      :class="{ active: isDrawing }"
      @click="handleClick"
      :title="title"
    >
      <i :class="icon" :style="iconStyle"></i>
    </button>
  </div>
</template>

<style scoped>
.draw-tool-wrapper {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.vertices-table {
  pointer-events: auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.vertices-table table {
  border-collapse: collapse;
  font-size: 12px;
  min-width: 280px;
}

.vertices-table th,
.vertices-table td {
  padding: 4px 8px;
  text-align: right;
  border-bottom: 1px solid #e5e7eb;
}

.vertices-table th {
  font-weight: 600;
  background-color: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.vertices-table tbody tr:last-child td {
  border-bottom: none;
}

.vertices-table tbody tr:hover {
  background-color: #f9fafb;
}

.draw-tool-button {
  pointer-events: auto;
  width: 34px;
  height: 34px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.draw-tool-button:hover {
  background-color: #f5f5f5;
}

.draw-tool-button:active {
  background-color: #e8e8e8;
}

.draw-tool-button.active {
  background-color: #2563eb;
}

.draw-tool-button.active i {
  color: #fff;
}

.draw-tool-button i {
  color: #333;
  line-height: 1;
}
</style>
