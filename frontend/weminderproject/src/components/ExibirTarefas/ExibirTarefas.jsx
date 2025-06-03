import React, { useEffect, useState, useMemo } from "react";

const ExibirTarefas = () => {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [itemClicked, setItemClicked] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8800/tarefas")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Erro ao buscar tarefas:", error));
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [data]);

  function clicked(item) {
    setItemClicked(item);
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
    setItemClicked(null);
  }

  return (
    <div className="content">
      {sortedData.map((item) => (
        <React.Fragment key={item.id}>
          <h1 className="data">
            {new Date(item.due_date).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h1>
          <div className="task_box">
            <div className="task_title">
              <h2>Título: {item.title}</h2>
            </div>
            <div className="task_desc">
              <p>Descrição: {item.description}</p>
            </div>
            <img
              src="/images/button.png"
              className="button_more"
              alt="Mais informações"
              onClick={() => clicked(item)}
            />
          </div>
        </React.Fragment>
      ))}

      {modalIsOpen && itemClicked && (
        <div className="modal">
          <div className="modal-content">
            <h1>
              <b>Detalhes da Tarefa</b>
            </h1>
            <p>
              <strong>Título: </strong> {itemClicked.title}
            </p>
            <p>
              <strong>Descrição: </strong> {itemClicked.description}
            </p>
            <button onClick={closeModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExibirTarefas;
