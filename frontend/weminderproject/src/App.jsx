import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import CadastroDeTarefas from './components/CadastroDeTarefas/cadastroDeTarefas';
import TarefasSimples from './components/CadastroDeTarefas/tarefasSimples';
import Tasks from './components/Tasks/Tasks';
import React, { useState } from 'react';
import TarefasComplexas from './components/CadastroDeTarefas/tarefasComplexas';

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
      <Sidebar/>
      <TarefasSimples/>
      <TarefasComplexas/>
      <Tasks clicked={clicked}/>     
      {modalOpen && <CadastroDeTarefas itemClicked={itemClicked} closeModal={closeModal} /> }
      
    </div>
    
  );
}

export default App;
