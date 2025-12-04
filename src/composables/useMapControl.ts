import { inject, onBeforeUnmount, watchEffect, type Ref } from 'vue';
import type { Map as MapLibreMap, IControl } from 'maplibre-gl';

interface MapControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Composable for creating MapLibre IControl components
 * Handles the boilerplate of adding/removing controls
 */
export function useMapControl(
  props: MapControlProps,
  createControlFn: (map: MapLibreMap) => IControl
) {
  const map = inject<Ref<MapLibreMap | null>>('map');
  let control: IControl | null = null;
  let stopWatch: (() => void) | null = null;

  stopWatch = watchEffect(() => {
    if (!map || !map.value) return;

    if (stopWatch) {
      stopWatch();
      stopWatch = null;
    }

    control = createControlFn(map.value);
    map.value.addControl(control, props.position);
  });

  onBeforeUnmount(() => {
    if (map && map.value && control) {
      try {
        map.value.removeControl(control);
      } catch (error) {
        console.warn('Error removing control:', (error as Error).message);
      }
    }
  });

  return { map, control };
}

interface ButtonControl extends IControl {
  _map?: MapLibreMap;
  _container?: HTMLDivElement;
  _button?: HTMLButtonElement;
}

/**
 * Factory for creating standard button controls
 */
export function createButtonControl(
  icon?: string,
  image?: string,
  title?: string,
  iconSize?: number,
  clickHandler?: (this: GlobalEventHandlers, ev: MouseEvent) => any
): ButtonControl {
  return {
    onAdd(map: MapLibreMap): HTMLElement {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

      this._button = document.createElement('button');
      this._button.className = 'map-button';
      this._button.type = 'button';
      this._button.title = title || '';
      this._button.onclick = clickHandler || null;

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
        iconElement.style.fontSize = `${iconSize || 16}px`;
        this._button.appendChild(iconElement);
      }

      this._container.appendChild(this._button);

      return this._container;
    },

    onRemove(): void {
      if (this._container && this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._map = undefined;
    }
  };
}
