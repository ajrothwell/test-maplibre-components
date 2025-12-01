<script setup>
import { useMapControl, createButtonControl } from '../composables/useMapControl';

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

const handleClick = () => {
  emit('click');
};

// Use the composable to handle control lifecycle
useMapControl(props, () =>
  createButtonControl(props.icon, props.image, props.title, props.iconSize, handleClick)
);
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
