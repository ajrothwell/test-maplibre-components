<script setup>
import { inject, ref, onBeforeUnmount, watchEffect, watch } from 'vue';

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
const drawLabelsSourceId = 'drawing-labels-source';
const drawLabelsLayerId = 'drawing-labels-layer';
const completedPolygonsSourceId = 'completed-polygons-source';
const completedPolygonsLayerId = 'completed-polygons-layer';
const completedPolygonsLineLayerId = 'completed-polygons-line-layer';
const completedPolygonsPointsLayerId = 'completed-polygons-points-layer';
const completedPolygonsLabelsSourceId = 'completed-polygons-labels-source';
const completedPolygonsLabelsLayerId = 'completed-polygons-labels-layer';

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

// Calculate midpoint between two points
const calculateMidpoint = (point1, point2) => {
  return {
    lng: (point1.lng + point2.lng) / 2,
    lat: (point1.lat + point2.lat) / 2
  };
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

  // Update segment labels
  const labelFeatures = [];
  for (let i = 1; i < drawingPoints.value.length; i++) {
    const point1 = drawingPoints.value[i - 1];
    const point2 = drawingPoints.value[i];
    const midpoint = calculateMidpoint(point1, point2);
    const distance = calculateDistance(point1, point2);

    labelFeatures.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [midpoint.lng, midpoint.lat]
      },
      properties: {
        distance: `${distance} ft`
      }
    });
  }

  // Add label for closing segment if we have at least 3 points
  if (drawingPoints.value.length >= 3) {
    const firstPoint = drawingPoints.value[0];
    const lastPoint = drawingPoints.value[drawingPoints.value.length - 1];
    const midpoint = calculateMidpoint(lastPoint, firstPoint);
    const distance = calculateDistance(lastPoint, firstPoint);

    labelFeatures.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [midpoint.lng, midpoint.lat]
      },
      properties: {
        distance: `${distance} ft`
      }
    });
  }

  const labelsSource = map.value.getSource(drawLabelsSourceId);
  if (labelsSource) {
    labelsSource.setData({
      type: 'FeatureCollection',
      features: labelFeatures
    });
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

  // Update segment labels for completed polygons
  const labelFeatures = completedPolygons.value.flatMap((polygon) => {
    const labels = [];
    for (let i = 1; i < polygon.points.length; i++) {
      const point1 = polygon.points[i - 1];
      const point2 = polygon.points[i];
      const midpoint = calculateMidpoint(point1, point2);
      const distance = calculateDistance(point1, point2);

      labels.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [midpoint.lng, midpoint.lat]
        },
        properties: {
          distance: `${distance} ft`,
          polygonId: polygon.id,
          active: polygon.id === activePolygonId.value
        }
      });
    }

    // Add label for closing segment
    if (polygon.points.length >= 3) {
      const firstPoint = polygon.points[0];
      const lastPoint = polygon.points[polygon.points.length - 1];
      const midpoint = calculateMidpoint(lastPoint, firstPoint);
      const distance = calculateDistance(lastPoint, firstPoint);

      labels.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [midpoint.lng, midpoint.lat]
        },
        properties: {
          distance: `${distance} ft`,
          polygonId: polygon.id,
          active: polygon.id === activePolygonId.value
        }
      });
    }

    return labels;
  });

  const labelsSource = map.value.getSource(completedPolygonsLabelsSourceId);
  if (labelsSource) {
    labelsSource.setData({
      type: 'FeatureCollection',
      features: labelFeatures
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

  try {
    // Remove click handler
    if (mapClickHandler) {
      map.value.off('click', mapClickHandler);
      mapClickHandler = null;
    }

    // Remove layers and source
    if (map.value.getLayer && map.value.getLayer(drawLabelsLayerId)) {
      map.value.removeLayer(drawLabelsLayerId);
    }
    if (map.value.getLayer && map.value.getLayer(drawPointsLayerId)) {
      map.value.removeLayer(drawPointsLayerId);
    }
    if (map.value.getLayer && map.value.getLayer(drawLineLayerId)) {
      map.value.removeLayer(drawLineLayerId);
    }
    if (map.value.getLayer && map.value.getLayer(drawLayerId)) {
      map.value.removeLayer(drawLayerId);
    }
    if (map.value.getSource && map.value.getSource(drawLabelsSourceId)) {
      map.value.removeSource(drawLabelsSourceId);
    }
    if (map.value.getSource && map.value.getSource(drawPointsSourceId)) {
      map.value.removeSource(drawPointsSourceId);
    }
    if (map.value.getSource && map.value.getSource(drawSourceId)) {
      map.value.removeSource(drawSourceId);
    }
  } catch (error) {
    // Ignore errors during hot reload when map is being destroyed
    console.warn('Error cleaning up drawing layers:', error.message);
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

  // Add labels source for completed polygons
  if (!map.value.getSource(completedPolygonsLabelsSourceId)) {
    map.value.addSource(completedPolygonsLabelsSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  }

  // Add labels layer for completed polygons
  if (!map.value.getLayer(completedPolygonsLabelsLayerId)) {
    map.value.addLayer({
      id: completedPolygonsLabelsLayerId,
      type: 'symbol',
      source: completedPolygonsLabelsSourceId,
      layout: {
        'text-field': ['get', 'distance'],
        'text-size': 12,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#ff0000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
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

    // Add source and layer for segment labels
    if (!map.value.getSource(drawLabelsSourceId)) {
      map.value.addSource(drawLabelsSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    if (!map.value.getLayer(drawLabelsLayerId)) {
      map.value.addLayer({
        id: drawLabelsLayerId,
        type: 'symbol',
        source: drawLabelsSourceId,
        layout: {
          'text-field': ['get', 'distance'],
          'text-size': 12,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
        },
        paint: {
          'text-color': '#ff0000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
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

// Create table HTML
const createTableHTML = () => {
  const points = getDisplayPoints();
  if (points.length === 0) return '';

  let rows = '';
  points.forEach((point, index) => {
    const distance = index === 0 ? '-' : calculateDistance(points[index - 1], point);
    rows += `
      <tr>
        <td>${point.lat.toFixed(6)}</td>
        <td>${point.lng.toFixed(6)}</td>
        <td>${distance}</td>
      </tr>
    `;
  });

  return `
    <table>
      <thead>
        <tr>
          <th>Lat</th>
          <th>Lng</th>
          <th>Distance (ft)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

// Update table display
const updateTableDisplay = () => {
  if (!controlInstance) return;

  const tableContainer = controlInstance._tableContainer;
  if (!tableContainer) return;

  const shouldShow = (isDrawing.value && drawingPoints.value.length > 0) ||
                     (activePolygonId.value !== null && getActivePolygon());

  if (shouldShow) {
    tableContainer.style.display = 'block';
    tableContainer.innerHTML = createTableHTML();
  } else {
    tableContainer.style.display = 'none';
  }
};

// Watch for changes to update table
watch([isDrawing, drawingPoints, activePolygonId, completedPolygons], () => {
  updateTableDisplay();
}, { deep: true });

// Create a MapLibre IControl for DrawTool
class DrawToolControl {
  constructor(icon, title, iconSize, clickHandler) {
    this._icon = icon;
    this._title = title;
    this._iconSize = iconSize;
    this._clickHandler = clickHandler;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl';
    this._container.style.display = 'flex';
    this._container.style.alignItems = 'flex-end';
    this._container.style.gap = '10px';

    // Create table container
    this._tableContainer = document.createElement('div');
    this._tableContainer.className = 'vertices-table';
    this._tableContainer.style.display = 'none';

    // Create button container
    this._buttonContainer = document.createElement('div');
    this._buttonContainer.className = 'maplibregl-ctrl-group';

    this._button = document.createElement('button');
    this._button.className = 'map-button';
    this._button.type = 'button';
    this._button.title = this._title;
    this._button.onclick = this._clickHandler;

    const iconElement = document.createElement('i');
    iconElement.className = this._icon;
    iconElement.style.fontSize = `${this._iconSize}px`;

    this._button.appendChild(iconElement);
    this._buttonContainer.appendChild(this._button);

    this._container.appendChild(this._tableContainer);
    this._container.appendChild(this._buttonContainer);

    return this._container;
  }

  setActive(active) {
    if (this._button) {
      if (active) {
        this._button.classList.add('active');
      } else {
        this._button.classList.remove('active');
      }
    }
  }

  onRemove() {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = undefined;
  }
}

let controlInstance = null;

// Setup drawing layers and control when map is ready
let stopWatch = null;
stopWatch = watchEffect(() => {
  if (!map.value) return;

  if (stopWatch) {
    stopWatch();
    stopWatch = null;
  }

  // Add the control to the map
  controlInstance = new DrawToolControl(props.icon, props.title, props.iconSize, handleClick);
  map.value.addControl(controlInstance, props.position);

  // Wait for map to load before setting up layers
  if (map.value.loaded()) {
    setupCompletedPolygonsLayers();
  } else {
    map.value.once('load', () => {
      setupCompletedPolygonsLayers();
    });
  }
});

// Watch isDrawing to update button style
watch(isDrawing, (newValue) => {
  if (controlInstance) {
    controlInstance.setActive(newValue);
  }
});

onBeforeUnmount(() => {
  cleanupDrawing();

  // Remove polygon click handler
  try {
    if (map.value && polygonClickHandler) {
      map.value.off('click', polygonClickHandler);
    }
  } catch (error) {
    // Ignore errors during hot reload
    console.warn('Error removing polygon click handler:', error.message);
  }

  // Remove control
  if (map.value && controlInstance) {
    try {
      map.value.removeControl(controlInstance);
    } catch (error) {
      console.warn('Error removing draw tool control:', error.message);
    }
  }
});
</script>

<template>
  <!-- Control is added directly to the map, no template needed -->
</template>

<style>
/* Global styles for draw tool control */
.map-button.active {
  background-color: #088;
}

.map-button.active i {
  color: #fff;
}

.vertices-table {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.vertices-table table {
  border-collapse: collapse;
  font-size: 12px;
  min-width: 250px;
}

.vertices-table th,
.vertices-table td {
  padding: 4px 8px;
  text-align: right;
  border-bottom: 1px solid #eee;
}

.vertices-table th {
  font-weight: 600;
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
}

.vertices-table tr:last-child td {
  border-bottom: none;
}
</style>
