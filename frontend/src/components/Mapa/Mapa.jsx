import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrige ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Componente que atualiza a posição do mapa
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      console.log("MapUpdater: centralizando mapa em", position);
      map.setView(position, 13); // centraliza quando position muda
    }
  }, [position, map]);
  return null;
}

export default function MapaInterativo({ onPositionChange }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState([-23.55052, -46.633308]); // São Paulo padrão

  // Função para buscar local pelo nome usando Nominatim (OpenStreetMap)
  async function buscarLocal(e) {
    e.preventDefault();
    if (!query) return;

    console.log("Buscando local:", query);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "MeuAppTeste/1.0", // necessário para Nominatim
            "Accept-Language": "pt-BR",
          },
        }
      );

      console.log("Status da resposta da API:", res.status);

      if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);

      const data = await res.json();
      console.log("Dados recebidos da API:", data);

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const coords = [parseFloat(lat), parseFloat(lon)];
        setPosition(coords);
        console.log("Nova posição setada:", coords);

        if (onPositionChange) {
          onPositionChange(coords);
          console.log("onPositionChange chamado com:", coords);
        }
      } else {
        alert("Local não encontrado.");
      }
    } catch (err) {
      console.error("Erro ao buscar local:", err);
      alert("Erro ao buscar local. Verifique o console para detalhes.");
    }
  }

  // Log sempre que a posição interna mudar
  useEffect(() => {
    console.log("Estado interno position atualizado:", position);
  }, [position]);

  return (
    <div className="h-[500px] flex flex-col items-center space-y-4 p-4">
      {/* Campo de busca */}
      <div className="flex w-full max-w-md space-x-2">
        <input
          type="text"
          placeholder="Digite um endereço..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={buscarLocal}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Buscar
        </button>
      </div>

      {/* Container do mapa */}
      <div className="w-full flex-1 rounded-xl overflow-hidden shadow-lg">
        <MapContainer center={position} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {position && (
            <Marker position={position}>
              <Popup>📍 {query || "Local atual"}</Popup>
            </Marker>
          )}
          <MapUpdater position={position} />
        </MapContainer>
      </div>
    </div>
  );
}
