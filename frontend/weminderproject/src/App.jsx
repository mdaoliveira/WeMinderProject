import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import CadastroDeTarefas from './components/CadastroDeTarefas/CadastroDeTarefas';
import ExibirTarefas from './components/ExibirTarefas/ExibirTarefas';
import Tasks from './components/Tasks/Tasks';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function AppContent() {
  const[modalOpen, setModalIsOpen] = useState(false);
  const[modalType, setModalType] = useState(null);
  const[itemClicked, setItemClicked] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);


  function clicked(item){
    console.log("Clicou");
    setModalIsOpen(true);
    setModalType('detalhes');
    setItemClicked(item);
  }

  function closeModal(){
    setModalIsOpen(false);
    setItemClicked(null);
    setModalType(null);
  }

  const navigate = useNavigate();

  function cadastroClicked() {
    setModalType('cadastro');
    setModalIsOpen(true);
  }

  function exibirClicked() {
    navigate('/exibir');
  }

  function inicioClicked(){
    navigate("/");
  }

  // <button onClick={() => {
  // setModalType('editar');
  // setModalIsOpen(true);
  // }}>Editar</button>


  function ExcluirTarefas(id) {
    fetch(`http://localhost:8800/tarefas/${id}`, {
      method: "DELETE",
    })
    .then(() => {
      closeModal();
      setReloadCount(prev => prev + 1);
    })
    .catch((error) => console.error("Erro ao deletar registro -> ", error));
  };

  return (
    <div className="App">
      <Sidebar inicioClick={inicioClicked} cadastroClick={cadastroClicked} exibirClick={exibirClicked}/>
      {/* MODAL DE CADASTRO */}
      {modalOpen && modalType === 'cadastro' && (
        <div className="modal-show">
          <CadastroDeTarefas itemClicked={itemClicked} closeModal={closeModal} setReloadCount={setReloadCount}/>
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalOpen && modalType === 'detalhes' && itemClicked && (
        <div className="modal-show">
          <div className="modal-content">
            <h1><b>Detalhes da Tarefa</b></h1>
            <p><strong>Título: </strong>{itemClicked.title}</p>
            <p><strong>Descrição: </strong>{itemClicked.description}</p>

            

            {itemClicked.subtasks && itemClicked.subtasks.length > 0 &&(
              <div className="subtarefa-detalhes">
                <h2>Subtarefas</h2>
                {itemClicked.subtasks.map((sub, index) => (
                  <div key={index} className="subtarefa-item">
                    <hr />
                    <p><strong>Título: </strong>{sub.title}</p>
                    <p><strong>Descrição: </strong>{sub.description}</p>
                    <p><strong>Data: </strong>{
                      new Date(sub.due_date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    }</p>
                  </div>
                ))}
              </div>
            )}

        
            <div className="button-content">
              <button onClick={closeModal}>Fechar</button>
              <button onClick={() => ExcluirTarefas(itemClicked.id)}>Excluir</button>
              {/* <button onClick={() => {setModalType('editar'); setModalIsOpen(true);}}>Editar</button> */}
            </div>
          </div>
        </div>
      )}

      {/* {modalOpen && modalType === 'editar' && itemClicked && (
              <div className="modal-show">
                <EditarTarefas
                  item={itemClicked}
                  closeModal={closeModal}
                  setReloadCount={setReloadCount}
                />
              </div>
      )} */}

      <Routes>
        <Route path="/" element={<Tasks onTaskClicked={clicked} reloadPage={reloadCount}/>} />
        <Route path="/exibir" element={<ExibirTarefas onTaskClicked={clicked} reloadPage={reloadCount}/>} />
      </Routes>
    </div>
  );
}

function App(){
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
