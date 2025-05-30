import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import CadastroDeTarefas from './components/CadastroDeTarefas/CadastroDeTarefas';
import TarefasSimples from './components/CadastroDeTarefas/TarefasSimples';
import Tasks from './components/Tasks/Tasks';
import React, { useState } from 'react';
import TarefasComplexas from './components/CadastroDeTarefas/TarefasComplexas';

function App() {
  const[modalOpen, setModalIsOpen] = useState(false);
  const[itemClicked, setItemClicked] = useState(null);

  function clicked(item){
    console.log("Clicou");
    setModalIsOpen(true);
    setItemClicked(item);
  }

  function closeModal(){
    setModalIsOpen(false);
    setItemClicked(null);
  }

  return (
    <div className="App">
      <Sidebar cadastroClick={() => setModalIsOpen(true)}/>
      {/* cadastro */}
      {modalOpen && (
        <div className="modal-show">
      <CadastroDeTarefas itemClicked={itemClicked} closeModal={closeModal} /> 
          </div>
      )}
      <Tasks />     
    </div>
    
  );
}

export default App;
