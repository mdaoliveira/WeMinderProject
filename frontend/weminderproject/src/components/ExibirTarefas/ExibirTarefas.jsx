import React, { useEffect, useState } from "react";

const ExibirTarefas = () => {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [itemClicked, setItemClicked] = useState(null);

  // Buscar tarefas ao carregar
  useEffect(() => {
    fetchTarefas();
  }, []);

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

  const clicked = (item) => {
    setItemClicked(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setItemClicked(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8800/tarefas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar.");

      // Remove do estado local
      setData((prev) => prev.filter((t) => t.id !== id));
      closeModal();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
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
                src="/images/button.png"
                className="button_more"
                alt="Mais informações"
                onClick={() => clicked(tarefa)}
              />
            </div>
          </React.Fragment>
        );
      })}

      {modalIsOpen && itemClicked && (
        <div className="modal">
          <div className="modal-content">
            <h1><b>Detalhes da Tarefa</b></h1>
            <p><strong>Título: </strong> {itemClicked.title}</p>
            <p><strong>Descrição: </strong> {itemClicked.description}</p>
            <button onClick={closeModal}>Fechar</button>
            <button onClick={() => handleDelete(itemClicked.id)}>Excluir</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExibirTarefas;