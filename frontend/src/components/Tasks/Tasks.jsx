import React, { useEffect, useState, useMemo } from "react";
import Card from "../card/card";

const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

const isDaily = (task) => {
  return task.is_daily;
}

const Tasks = ({ onTaskClicked, reloadPage }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8800/tarefas")
      .then((response) => response.json())
      .then((data) => {
        // Ordena as tarefas por data e prioridade
        const sortedData = data.sort((a, b) => {
          const dataA = new Date(a.due_date);
          const dataB = new Date(b.due_date);

          if (dataA.getTime() !== dataB.getTime()) {
            return dataA - dataB;
          }

          let aIsZero;
          if (a.priority === 0) {
            aIsZero = 1;
          } else {
            aIsZero = 0;
          }
          let bIsZero;
          if (b.priority === 0) {
            bIsZero = 1;
          } else {
            bIsZero = 0;
          }
          
          // ir por último
          if (aIsZero !== bIsZero) {
            return aIsZero - bIsZero;
          }

          return a.priority - b.priority;
        });
        setData(sortedData);
      })
      .catch((error) => console.error("Erro:", error));
  }, [reloadPage]);

  // tarefas do dia
  const todayTasks = useMemo(() => {
    return data.filter((item) => isToday(new Date(item.due_date)));
  }, [data]);
  
  const dailyTasks = useMemo(() => {
    return data.filter((item) => isDaily(item));
  }, [data]);


  if (todayTasks.length === 0 && dailyTasks.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[color:var(--background-color)] text-[color:var(--text-color)] dark:text-gray-400">
        Nenhuma tarefa para hoje.
      </div>
    );
  }


  let TarefasDiarias = "";
  if(dailyTasks.length > 0) { TarefasDiarias = "Tarefas diárias "; }

  // Data formatada para exibir uma vez só no topo
  const dataFormatada = new Date(todayTasks[0].due_date).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ordenação do card
  const getCardPosition = () => {
    const pos = getComputedStyle(document.documentElement).getPropertyValue("--card-position").trim();
    return pos === "colunas" ? "colunas" : "lista";
  };

  const cardPosition = getCardPosition();
  // posicao colunas
  if (cardPosition === "colunas") {
    return (
      <div className="w-full min-h-screen overflow-x-auto flex flex-row flex-wrap justify-start gap-8 px-1 py-1
      bg-[color:var(--background-color)] dark:bg-gray-900">
        <div className="flex flex-col items-start bg-transparent">
          <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mb-3">
            {dataFormatada}
          </h1>
          <div className="flex flex-col gap-4">
            {todayTasks.map((tarefa) => (
              Card(tarefa, onTaskClicked)
            ))}
          </div>
          <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mb-3">
            {TarefasDiarias}
          </h1>
          <div className="flex flex-col gap-4">
            {dailyTasks.map((tarefa) => (
              Card(tarefa, onTaskClicked)
            ))}
          </div>
        </div>
      </div>
    );
  }

  // posicao lista
  return (
    <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[color:var(--background-color)] dark:bg-gray-900 px-4 py-8">
      <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mt-6 mb-2 w-full max-w-xl text-left">
        {dataFormatada}
      </h1>
      {todayTasks.map((tarefa) => (
        Card(tarefa, onTaskClicked)
      ))}

      <h1 className="text-gray-700 dark:text-gray-300 text-lg font-bold mt-6 mb-4 w-full max-w-xl text-left">
        {dataFormatada}
      </h1>

      {todayTasks.map((tarefa) => (
        Card(tarefa, onTaskClicked)
      ))}
    </div>
  );
};

export default Tasks;
