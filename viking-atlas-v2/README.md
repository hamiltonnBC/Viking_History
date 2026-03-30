# Viking Atlas v2

Viking Atlas is an interactive, historical web-based mapping application that visualizes the expansion, raids, and trade routes of the Norse peoples throughout the Viking Age (c. 750–1100 AD). 

It has been rebuilt from the ground up as a modern, maintainable **React + TypeScript + Vite** application.

## Features

- **Interactive Timeline**: Scrub through the years from 750 AD to 1100 AD to watch the Viking world expand.
- **Dynamic Map Annotations**: Hotspots and routes automatically reveal themselves based on the current year.
- **Deep Zoom & Pan**: A rich, D3-powered geographic map that supports zooming and panning smoothly to investigate distant voyages (like the settlement of Greenland and Vinland).
- **Historical Context**: Select events to learn the detailed history behind raids, settlements, and conquests.

## Architecture & Tech Stack

The application heavily utilizes a "React-first" approach to Data-Driven Documents (D3):
- **React 19**: Manages all component state and declarative rendering.
- **TypeScript**: Ensures strong typing of domains like `VikingEvent`, `Era`, and `Route`.
- **D3.js (d3-geo & d3-zoom)**: Handles the complex cartographic math, map projections (Mercator), and zoom events without directly mutating the DOM.
- **Vite**: Provides blazing fast Hot Module Replacement (HMR) and optimized production builds.

For detailed technical design notes, please read the [ARCHITECTURE.md](./ARCHITECTURE.md) guide.

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or navigate to the repository:
   ```bash
   cd viking-atlas-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The app will be running locally (usually at `http://localhost:5173`).

### Building for Production

To create an optimized bundle for deployment:
```bash
npm run build
```
The static files will be generated in the `dist/` directory, ready to be hosted on any static web server (Vercel, Netlify, GitHub Pages, etc.).

## Directory Structure

- `src/components/`: Reusable React components (`Header`, `Timeline`, `InfoPanel`, and the `MapContainer`).
- `src/data/`: Static typed JSON data defining the events, eras, and routes (`vikingData.ts`).
- `public/data/`: Hosts large static files like the world map GeoJSON.
- `legacy/`: An archive of the original Vanilla JS implementation.

## Contributions

Feel free to add more historical data objects to `src/data/vikingData.ts`. New events require a `year`, GPS `coords` `[lng, lat]`, text `body`, and can trigger optional historical `routes` arrays.

---

### Made by Nicholas Hamilton & America Gaona Borges

**Nicholas Hamilton**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamiltonnBC)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nicholas-trey-hamilton/)

**America Gaona Borges**  
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gaonaborgesa)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/america-gaona-borges/)
