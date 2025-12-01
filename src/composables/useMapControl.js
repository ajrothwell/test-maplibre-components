import { inject, onBeforeUnmount, watchEffect } from 'vue';

/**
 * Composable for creating MapLibre IControl components
 * Handles the boilerplate of adding/removing controls
 */
export function useMapControl(props, createControlFn) {
  const map = inject('map');
  let control = null;
  let stopWatch = null;

  stopWatch = watchEffect(() => {
    if (!map.value) return;

    if (stopWatch) {
      stopWatch();
      stopWatch = null;
    }

    control = createControlFn(map.value);
    map.value.addControl(control, props.position);
  });

  onBeforeUnmount(() => {
    if (map.value && control) {
      try {
        map.value.removeControl(control);
      } catch (error) {
        console.warn('Error removing control:', error.message);
      }
    }
  });

  return { map, control };
}

/**
 * Factory for creating standard button controls
 */
export function createButtonControl(icon, image, title, iconSize, clickHandler) {
  return {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

      this._button = document.createElement('button');
      this._button.className = 'map-button';
      this._button.type = 'button';
      this._button.title = title;
      this._button.onclick = clickHandler;

      // If image is provided, use it as background
      if (image) {
        this._button.style.backgroundImage = `url("${image}")`;
        this._button.style.backgroundSize = 'cover';
        this._button.style.backgroundPosition = 'center';
        this._button.style.backgroundRepeat = 'no-repeat';
        this._button.classList.add('has-image');
      } else if (icon) {
        // Otherwise use icon
        const iconElement = document.createElement('i');
        iconElement.className = icon;
        iconElement.style.fontSize = `${iconSize}px`;
        this._button.appendChild(iconElement);
      }

      this._container.appendChild(this._button);

      return this._container;
    },

    onRemove() {
      if (this._container && this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._map = undefined;
    }
  };
}
