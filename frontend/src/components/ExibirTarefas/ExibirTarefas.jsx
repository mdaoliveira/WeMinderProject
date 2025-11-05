import { useEffect, useState } from "react";
import Card from "../card/card";

const ExibirTarefas = ({ onTaskClicked, reloadPage }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTarefas();
  }, [reloadPage]);

  const fetchTarefas = () => {
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
  };

  let ultimaDataExibida = "";

  return (
    <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center bg-gray-100 dark:bg-gray-900 px-4 py-8">
      {data.map((tarefa) => {
        const dataFormatada = new Date(tarefa.due_date).toLocaleDateString(
          "pt-BR",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

        const deveExibirData = dataFormatada !== ultimaDataExibida;
        if (deveExibirData) ultimaDataExibida = dataFormatada;

        return (
          Card(tarefa,onTaskClicked)
        );
      })}
    </div>
  );
};

export default ExibirTarefas;