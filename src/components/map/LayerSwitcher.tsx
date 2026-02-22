import React from "react";
import { TileLayer, LayersControl } from "react-leaflet";
import { useTheme } from "../../store/themeContext";

const { BaseLayer } = LayersControl;

const LayerSwitcher: React.FC = () => {
  const { theme } = useTheme();

  const baseUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <LayersControl position="bottomright">
      <BaseLayer checked name="Default">
        <TileLayer
          key={theme}
          url={baseUrl}
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
      </BaseLayer>
      <BaseLayer name="Satellite">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
      </BaseLayer>
      <BaseLayer name="Terrain">
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenTopoMap contributors"
        />
      </BaseLayer>
    </LayersControl>
  );
};

export default LayerSwitcher;
