import { useState, useEffect } from 'react';

function TarefasComplexas({ onChange }) {
  const [title, setNewTitle] = useState("");
  const [description, setNewDescription] = useState("");
  const [due_date, setNewDueDate] = useState("");
  const [subtasks, setSubtasks] = useState([]);

  const adicionarSubtarefa = () => {
    setSubtasks([...subtasks, { title: "", description: "", due_date: "" }]);
  };

  const handleSubtarefaChange = (index, field, value) => {
    const novas = [...subtasks];
    novas[index] = { ...novas[index], [field]: value };
    setSubtasks(novas);
  };

  useEffect(() => {
    onChange?.({ title, description, due_date, subtasks });
  }, [title, description, due_date, subtasks, onChange]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Criar Tarefa Complexa</h2>

      <div className="space-y-2">
        <label className="block font-medium">Título</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={title}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Descrição</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={description}
          onChange={(e) => setNewDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium">Data</label>
        <input
          type="date"
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
          value={due_date}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Subtarefas</h3>
        <button
          type="button"
          onClick={adicionarSubtarefa}
          className="text-blue-600 hover:underline flex items-center space-x-1"
        >
          <u>Adicionar Subtarefa</u>
          <img src="/images/plus symbol.png" className="w-4 h-4" alt="Adicionar" />
        </button>
      </div>

      {subtasks.map((sub, index) => (
        <div key={index} className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 space-y-2">
          <label className="block font-medium">Título</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.title}
            onChange={(e) => handleSubtarefaChange(index, "title", e.target.value)}
          />

          <label className="block font-medium">Descrição</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.description}
            onChange={(e) => handleSubtarefaChange(index, "description", e.target.value)}
          />

          <label className="block font-medium">Data</label>
          <input
            type="date"
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
            value={sub.due_date}
            onChange={(e) => handleSubtarefaChange(index, "due_date", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default TarefasComplexas;
