import React, { useState, useEffect } from "react";
import MapaInterativo, { BuscaLocal, handleBuscar } from "../Mapa/Mapa";

const today = new Date().toISOString().split("T")[0];

function TarefasSimples({ onChange }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due_date, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    onChange({
      title,
      description,
      due_date,
      priority: priority === "" ? "" : parseInt(priority),
      position,
    });
  }, [title, description, due_date, priority,position, onChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Criar Tarefa Simples</h2>

      <div className="space-y-2">
        <label className="block font-medium">Título</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Descrição</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Data</label>
        <input
          type="date"
          min={today}
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={due_date}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <p className="font-medium">Prioridade</p>
        {[
          { label: "Sem Prioridade", value: 0 },
          { label: "Prioridade Alta", value: 1 },
          { label: "Prioridade Média", value: 2 },
          { label: "Prioridade Baixa", value: 3 },
        ].map(({ label, value }) => (
          <label key={value} className="flex items-center space-x-2">
            <input
              type="radio"
              name="priority"
              value={value}
              checked={priority === value || (value === "" && priority === "")}
              onChange={(e) => setPriority(e.target.value === "" ? "" : parseInt(e.target.value))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <MapaInterativo
          onPositionChange={(coords) => setPosition(coords.join(","))}
          mostrarBotao={true}

        />
      </div>
    </div>
  );
}

export default TarefasSimples;
