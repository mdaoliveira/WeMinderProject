import React, { useEffect, useState, useMemo } from "react";

const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

const Tasks = ({ onTaskClicked, reloadPage }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8800/tarefas")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );
        setData(sortedData);
      })
      .catch((error) => {
        console.error("Erro ao buscar tarefas:", error);
      });
  }, [reloadPage]);

  const todayTasks = useMemo(() => {
    return data.filter((item) => {
      const dueDate = new Date(item.due_date);
      return isToday(dueDate);
    });
  }, [data]);

  if (todayTasks.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Nenhuma tarefa para hoje.
      </div>
    );
  }

  // Data formatada para exibir uma vez só no topo
  const dataFormatada = new Date(todayTasks[0].due_date).toLocaleDateString(
    "pt-BR",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center bg-gray-100 dark:bg-gray-900 px-4 py-8">
      {/* Exibe a data apenas uma vez */}
      <h1 className="text-gray-700 dark:text-gray-300 text-lg font-bold mt-6 mb-4 w-full max-w-xl text-left">
        {dataFormatada}
      </h1>

      {todayTasks.map((tarefa) => (
        <div
          key={tarefa.id}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 w-full max-w-xl flex justify-between items-center cursor-pointer"
          onClick={() => onTaskClicked(tarefa)}
        >
          <div className="flex flex-col max-w-[85%]">
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2 truncate">
              Título: {tarefa.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 truncate">
              Descrição: {tarefa.description}
            </p>
          </div>

          <img
            src="/images/olho.png"
            alt="Mais informações"
            className="h-8 w-8 cursor-pointer ml-4"
            onClick={(e) => {
              e.stopPropagation(); // evitar disparar onClick do card
              onTaskClicked(tarefa);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Tasks;
