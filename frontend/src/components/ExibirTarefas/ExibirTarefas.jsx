import React, { useEffect, useState } from "react";
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

  const agruparPorData = (tarefas) => {
    const agrupado = [];
    let ultimaData = null;

    tarefas.forEach((tarefa) => {
      const dataFormatada = new Date(tarefa.due_date).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!ultimaData || ultimaData !== dataFormatada) {
        agrupado.push({ data: dataFormatada, tarefas: [tarefa] });
        ultimaData = dataFormatada;
      } else {
        agrupado[agrupado.length - 1].tarefas.push(tarefa);
      }
    });

    return agrupado;
  };

  const tarefasAgrupadas = agruparPorData(data);

  // posição dos cards 
  const getCardPosition = () => {
    const pos = getComputedStyle(document.documentElement).getPropertyValue("--card-position").trim();
    return pos === "colunas" ? "colunas" : "lista";
  };

  const cardPosition = getCardPosition();

  // posicão colunas
  if (cardPosition === "colunas") {
    return (
      <div
        className="w-full min-h-screen overflow-x-auto flex flex-row flex-wrap justify-start gap-8 px-1 py-1
        bg-[color:var(--background-color)] dark:bg-gray-900">
        {tarefasAgrupadas.map((conjtarefa) => (
          <div key={conjtarefa.data} className="flex flex-col items-start bg-transparent">
            <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mb-3">
              {conjtarefa.data}
            </h1>
            <div className="flex flex-col gap-4">
              {conjtarefa.tarefas.map((tarefa) => (
                Card(tarefa,onTaskClicked)
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // posição lista
  return (
    <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[color:var(--background-color)] dark:bg-gray-900 px-4 py-8">
      {tarefasAgrupadas.map((conjtarefa) => (
        <React.Fragment key={conjtarefa.data}>
          <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mt-6 mb-2 w-full max-w-xl text-left">
            {conjtarefa.data}
          </h1>
          {conjtarefa.tarefas.map((tarefa) => (
            Card(tarefa, onTaskClicked)
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ExibirTarefas;
