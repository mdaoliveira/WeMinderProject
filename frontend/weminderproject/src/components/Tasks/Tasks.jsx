import React, { useEffect, useState, useMemo } from "react";

const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

const Tasks = ({onTaskClicked, reloadPage}) => {
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

  let ultimaDataExibida = "";

  return (
    <div className="content">
      {todayTasks.map((tarefa) => {
        const dataFormatada = new Date(tarefa.due_date).toLocaleDateString(
          "pt-BR",
          { day: "numeric", month: "long", year: "numeric" }
        );

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
                src="/images/button.png"
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

export default Tasks;
