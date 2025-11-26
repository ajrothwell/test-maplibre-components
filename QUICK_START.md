# Quick Start Guide - MapLibre Vue Demo

## Option 1: Download and Run (Recommended)

1. **Download** the `maplibre-vue-demo.tar.gz` file

2. **Extract** the archive:
   ```bash
   tar -xzf maplibre-vue-demo.tar.gz
   cd maplibre-vue-demo
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to http://localhost:5173

That's it! You should see a working interactive map with controls.

## Option 2: Create from Scratch

If you prefer to create the project yourself:

```bash
# Create a new Vue project
npm create vite@latest maplibre-vue-demo -- --template vue
cd maplibre-vue-demo

# Install dependencies
npm install
npm install maplibre-gl

# Copy the Map.vue component to src/components/
# Copy the App.vue to src/
# Update src/main.js and add styles

npm run dev
```

## What You'll See

- 🗺️ An interactive map centered on the New York area
- 🎮 Control buttons to fly to different cities
- 📍 Add random markers feature
- 📊 Real-time coordinate display
- 🎯 Click anywhere on the map to see coordinates

## Features to Try

1. **Fly to Cities**: Click the "Fly to New York", "Fly to London", or "Fly to Tokyo" buttons
2. **Add Markers**: Click "Add Random Marker" to place colorful markers on the map
3. **Click Coordinates**: Click anywhere on the map to see the exact coordinates
4. **Zoom & Pan**: Use mouse/touch to navigate the map
5. **Marker Popups**: Click on any marker to see its popup

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 3000
```

**Map not loading?**
- Check your internet connection (map tiles load from the internet)
- Make sure maplibre-gl is installed: `npm install maplibre-gl`

**Blank screen?**
- Open browser console (F12) to check for errors
- Make sure all files are in the correct locations

## Next Steps

- Customize the map style in `src/App.vue`
- Add your own markers and popups
- Integrate with your backend API
- Add GeoJSON layers for custom data visualization

Enjoy building with MapLibre and Vue! 🎉
