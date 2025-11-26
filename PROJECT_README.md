# MapLibre Vue Demo

A fully functional Vue 3 + Vite demo application showcasing the MapLibre GL JS map component.

## Features

- 🗺️ Interactive MapLibre GL JS map
- 🎯 Click to get coordinates
- ✈️ Fly to different cities (New York, London, Tokyo)
- 📍 Add and clear markers dynamically
- 📊 Real-time view information (zoom, center coordinates)
- 🎨 Modern, responsive UI

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (usually http://localhost:5173)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
maplibre-vue-demo/
├── src/
│   ├── components/
│   │   └── Map.vue          # Reusable MapLibre component
│   ├── App.vue              # Main demo application
│   ├── main.js              # Application entry point
│   └── styles.css           # Global styles
├── package.json
└── vite.config.js
```

## Map Component Usage

The `Map.vue` component accepts the following props:

- `center`: [lng, lat] - Initial map center
- `zoom`: number - Initial zoom level
- `style`: string/object - Map style URL or object
- `minZoom`: number - Minimum zoom level
- `maxZoom`: number - Maximum zoom level
- `pitch`: number - Initial pitch (tilt)
- `bearing`: number - Initial bearing (rotation)

Events:
- `@load`: Fired when map is loaded
- `@click`: Fired when map is clicked
- `@move`: Fired when map is moved
- `@zoom`: Fired when zoom changes

## Customization

You can customize the demo by:

1. Changing the map style in `App.vue`:
```javascript
const mapStyle = ref('YOUR_STYLE_URL');
```

2. Adding more city flyTo buttons
3. Implementing custom markers and popups
4. Adding GeoJSON layers

## Technologies Used

- Vue 3 (Composition API)
- Vite
- MapLibre GL JS
- JavaScript ES6+

## License

MIT
