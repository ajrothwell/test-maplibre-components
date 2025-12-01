<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
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
</script>

<template>
  <div class="map-button-container" :style="positionStyle">
    <button class="map-button" @click="handleClick" :title="title">
      <i :class="icon" :style="iconStyle"></i>
    </button>
  </div>
</template>

<style scoped>
.map-button-container {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.map-button {
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
}

.map-button:hover {
  background-color: #f5f5f5;
}

.map-button:active {
  background-color: #e8e8e8;
}

.map-button i {
  color: #333;
  line-height: 1;
}
</style>
