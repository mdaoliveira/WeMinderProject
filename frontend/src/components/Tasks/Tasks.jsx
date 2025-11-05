import { useEffect, useState, useMemo } from "react";
import Card from "../card/card";

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
        const sortedData = data.sort((a, b) => {
        const dataA = new Date(a.due_date);
        const dataB = new Date(b.due_date);

        if (dataA.getTime() !== dataB.getTime()) {
          return dataA - dataB;
        }

        // se prioridade é zero
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
        Card(tarefa, onTaskClicked)
      ))}
    </div>
  );
};

export default Tasks;
