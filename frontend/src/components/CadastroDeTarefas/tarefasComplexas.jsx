import { useState, useEffect } from 'react';

const today = new Date().toISOString().split("T")[0];

function TarefasComplexas({ onChange }) {
  const [title, setNewTitle] = useState("");
  const [description, setNewDescription] = useState("");
  const [due_date, setNewDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [subtasks, setSubtasks] = useState([]);

  const adicionarSubtarefa = () => {
    setSubtasks([...subtasks, { title: "", description: "", due_date: "", priority: null}]);
  };

  const handleSubtarefaChange = (index, field, value) => {
    const novas = [...subtasks];
    novas[index] = { ...novas[index], [field]: value };
    setSubtasks(novas);
  };

  useEffect(() => {
    onChange?.({ title, description, due_date, priority: priority === "" ? "" : parseInt(priority), subtasks });
  }, [title, description, due_date, priority, subtasks, onChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[color:var(--text-color)] dark:text-gray-100">Criar Tarefa Complexa</h2>
      
      <div className="space-y-2">
        <label className="block font-medium">Título</label>
        <input
          type="text"
          className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
          value={title}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Descrição</label>
        <input
          type="text"
          className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
          value={description}
          onChange={(e) => setNewDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Data</label>
        <input
          type="date"
          min={today}
          className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
          value={due_date}
          onChange={(e) => setNewDueDate(e.target.value)}
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
              checked={priority === value}
              onChange={(e) => setPriority(parseInt(e.target.value))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="text-[color:var(--text-color)] flex items-center justify-between mt-4">
        <h3 className="text-lg font-semibold dark:text-gray-100">Subtarefas</h3>
        <button
          type="button"
          onClick={adicionarSubtarefa}
          className="flex items-center space-x-1"
        >
          <p>Adicionar Subtarefa</p>
          <img src="/images/plus symbol.png" className="w-4 h-4" alt="Adicionar" />
        </button>
      </div>

      {subtasks.map((sub, index) => (
        <div key={index} className="p-4 border bg-[color:var(--card-color)] rounded-md dark:bg-gray-900 space-y-2">
          <label className="block font-medium">Título</label>
          <input
            type="text"
            className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.title}
            onChange={(e) => handleSubtarefaChange(index, "title", e.target.value)}
          />

          <label className="block font-medium">Descrição</label>
          <input
            type="text"
            className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.description}
            onChange={(e) => handleSubtarefaChange(index, "description", e.target.value)}
          />

          <label className="block font-medium">Data</label>
          <input
            type="date"
            min={today}
            max ={due_date}
            className="w-full p-2 border text-black rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.due_date}
            onChange={(e) => handleSubtarefaChange(index, "due_date", e.target.value)}
          />
        </div>
        
      ))}
    </div>
  );
}

export default TarefasComplexas;
