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

  function clicked(item){
    console.log("Clicou");
    setModalIsOpen(true);
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

  function exibirClick() {
    navigate('/exibir');
  }

  return (
    <div className="App">
      <Sidebar cadastroClick={cadastroClicked} exibirClick={exibirClick}/>
      {/* MODAL DE CADASTRO */}
      {modalOpen && modalType === 'cadastro' && (
        <div className="modal-show">
          <CadastroDeTarefas itemClicked={itemClicked} closeModal={closeModal} />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Tasks clicked={clicked} />} />
        <Route path="/exibir" element={<ExibirTarefas />} />
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
