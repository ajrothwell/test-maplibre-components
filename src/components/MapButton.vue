<script setup>
import { inject, onBeforeUnmount, watchEffect } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  iconSize: {
    type: Number,
    default: 18
  }
});

const emit = defineEmits(['click']);
const map = inject('map');

const handleClick = () => {
  emit('click');
};

// Create a MapLibre IControl
class ButtonControl {
  constructor(icon, image, title, iconSize, clickHandler) {
    this._icon = icon;
    this._image = image;
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

    // If image is provided, use it as background
    if (this._image) {
      this._button.style.backgroundImage = `url("${this._image}")`;
      this._button.style.backgroundSize = 'cover';
      this._button.style.backgroundPosition = 'center';
      this._button.style.backgroundRepeat = 'no-repeat';
      this._button.classList.add('has-image');
    } else if (this._icon) {
      // Otherwise use icon
      const iconElement = document.createElement('i');
      iconElement.className = this._icon;
      iconElement.style.fontSize = `${this._iconSize}px`;
      this._button.appendChild(iconElement);
    }

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

  control = new ButtonControl(props.icon, props.image, props.title, props.iconSize, handleClick);
  map.value.addControl(control, props.position);
});

onBeforeUnmount(() => {
  if (map.value && control) {
    try {
      map.value.removeControl(control);
    } catch (error) {
      console.warn('Error removing button control:', error.message);
    }
  }
});
</script>

<template>
  <!-- Control is added directly to the map, no template needed -->
</template>

<style>
/* Global styles for map button controls */
.map-button {
  width: 29px;
  height: 29px;
  background-color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.2s;
}

.map-button:hover:not(.has-image) {
  background-color: rgba(0, 0, 0, 0.05);
}

.map-button:active:not(.has-image) {
  background-color: rgba(0, 0, 0, 0.1);
}

.map-button.has-image:hover {
  opacity: 0.9;
}

.map-button.has-image:active {
  opacity: 0.8;
}

.map-button i {
  color: #333;
  line-height: 1;
}
</style>
