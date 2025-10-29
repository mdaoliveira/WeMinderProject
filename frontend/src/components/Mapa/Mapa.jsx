import { useState } from "react";
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

// Atualiza a posição do mapa sempre que a posição mudar
function MapUpdater({ position }) {
  const map = useMap();
  if (position) map.setView(position, 13);
  return null;
}

// 🔹 Componente do botão de busca separado e reutilizável
export function BuscaLocal({ onBuscar }) {
  const [query, setQuery] = useState("");

  async function handleBuscar(e) {
    e.preventDefault(); // 🔹 sempre no início
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        onBuscar(coords, query);
      } else {
        alert("Local não encontrado!");
      }
    } catch (error) {
      console.error("Erro ao buscar local:", error);
    }
  }

  return (
    <div className="flex gap-2 w-full max-w-md mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite um local"
        className="flex-1 p-2 border rounded-lg"
      />
      <button
        onClick={handleBuscar}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Buscar
      </button>
    </div>
  );
}

// 🔹 Componente principal do mapa
export default function MapaInterativo({
  onPositionChange,
  localSalvo = null, // deve vir como [lat, lng] ou null
  mostrarBotao = false
}) {
  // Se existir localSalvo, inicia com ele; senão null
  const [position, setPosition] = useState(localSalvo);
  const [query, setQuery] = useState("");

  // Função chamada pelo botão de busca
  function handleBuscar(coords, localQuery) {
    setPosition(coords);
    setQuery(localQuery);
    if (onPositionChange) onPositionChange(coords); // pai deve tratar null
  }

  // Função para apagar a posição do marcador
  function handleLimparMarcador() {
    setPosition(null);
    setQuery("");
    if (onPositionChange) onPositionChange(null); // envia null
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4 h-[500px]">
      {/* Botão de busca opcional */}
      {mostrarBotao && <BuscaLocal onBuscar={handleBuscar} />}

      {/* Botão para limpar o marcador */}
      {position && (
        <button
          onClick={handleLimparMarcador}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Apagar Marcador
        </button>
      )}

      <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={position || [-23.55052, -46.633308]} // padrão se não houver coordenadas externas
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {position && (
            <Marker position={position}>
              <Popup>📍 {query || "Local da tarefa"}</Popup>
            </Marker>
          )}
          <MapUpdater position={position} />
        </MapContainer>
      </div>
    </div>
  );
}
