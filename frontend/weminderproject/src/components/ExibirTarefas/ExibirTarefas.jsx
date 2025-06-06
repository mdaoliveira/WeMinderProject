import React, { useEffect, useState } from "react";

const ExibirTarefas = ({onTaskClicked, reloadPage}) => {
  const [data, setData] = useState([]);
  

  // Buscar tarefas ao carregar
  useEffect(() => {
    fetchTarefas();
  }, [reloadPage]);

  const fetchTarefas = () => {
    fetch("http://localhost:8800/tarefas")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(a.due_date) - new Date(b.due_date)
        );
        setData(sortedData);
      })
      .catch((error) => console.error("Erro ao buscar tarefas:", error));
  };

  let ultimaDataExibida = "";

  return (
    <div className="content">
      {data.map((tarefa) => {
        const dataFormatada = new Date(tarefa.due_date).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const deveExibirData = dataFormatada !== ultimaDataExibida;
        if (deveExibirData) ultimaDataExibida = dataFormatada;

        return (
          <React.Fragment key={tarefa.id}>
            {deveExibirData && <h1 className="data">{dataFormatada}</h1>}
            <div className="task_box">
              <div className="task_title">
                <h2>Título: {tarefa.title}</h2>
              </div>
              <div className="task_desc">
                <p>Descrição: {tarefa.description}</p>
              </div>
              <img
                src="/images/olho.png"
                className="button_more"
                alt="Mais informações"
                onClick={() => onTaskClicked(tarefa)}
              />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ExibirTarefas;