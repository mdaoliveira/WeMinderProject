import React, { useEffect, useState } from "react";

function Lixeira({ onTaskClicked, reloadPage }) {
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8800/lixeira")
      .then(res => res.json())
      .then(data => setTarefas(data))
      .catch(console.error);
  }, [reloadPage]);


  function excluirTarefaPermanente(id) {
    fetch(`http://localhost:8800/excluir/${id}`, 
        { method: "DELETE" })
      .then(() => 
        setTarefas(prev => prev.filter(t => t.id !== id)))
      .catch(console.error);
  }
  function excluirTudoPermanente() {
    fetch(`http://localhost:8800/excluirTudo`, 
        { method: "DELETE" })
      .then(() => 
        setTarefas([]))
      .catch(console.error);
  }
  function restaurarTarefa(id) {
  fetch(`http://localhost:8800/restaurar/${id}`, { method: "PUT" })
    .then(() => {
      setTarefas(prev => prev.filter(t => t.id !== id));
    })
    .catch((error) => console.error("Erro ao restaurar", error));
  }
  function restaurarTudo() {
    fetch(`http://localhost:8800/restaurarTudo`, {
      method: "PUT"
    })
    .then(() => 
        setTarefas([]))
      .catch((error) => console.error("Erro ao restaurar", error));
  };


  // Quando não há tarefas
  if (!tarefas || tarefas.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[color:var(--background-color)] text-[color:var(--text-color)] dark:text-gray-400">
        Nenhuma tarefa na lixeira.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center dark:bg-gray-900 gap-6 px-6 py-10">
        <div className="flex justify-items-end gap-4 sm:flex-row sm:items-center flex-col items-center w-full sm:w-auto mt-4 sm:mt-0">
        <button onClick={restaurarTudo} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-2 rounded"
        >
          Restaurar Tudo
        </button>
        <button
          onClick={excluirTudoPermanente} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded"
        >
          Excluir Tudo Permanentemente
        </button>
        </div>
      

      {/* cards */}
      <div className="grid flex-wrap gap-6 lg:grid-cols-3">
        {tarefas.map((task) => (
          <div key={task.id}
            className="flex flex-col justify-between p-5 rounded-xl shadow bg-[color:var(--card-color)] text-[color:var(--text-color)]"
          >
            <div>
              <h2 className="text-lg font-semibold mb-2">Título: {task.title}</h2>
              <p>Descrição: {task.description}</p>
              <p>Prioridade: {task.priority || "nenhuma"}</p>
            </div>

            <hr className="my-3 border-[color:var(--text-color)] opacity-40" />

            <div className="flex justify-between gap-2 flex-wrap w-full mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restaurarTarefa(task.id);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
              >
                Restaurar
              </button>
              <button
                onClick={() => onTaskClicked(task)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
              >
                Detalhes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  excluirTarefaPermanente(task.id);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lixeira;
