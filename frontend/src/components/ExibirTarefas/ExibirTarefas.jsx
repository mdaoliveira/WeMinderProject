import React, { useEffect, useState } from "react";

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
          <React.Fragment key={tarefa.id}>
            {/* const tarefasPrioridade = {tarefa.priority} */}
            {deveExibirData && (
              <h1 className="text-gray-700 dark:text-gray-300 text-lg font-bold mt-6 mb-2 w-full max-w-xl text-left">
                {dataFormatada}
              </h1>
            )}
            <div
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
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ExibirTarefas;