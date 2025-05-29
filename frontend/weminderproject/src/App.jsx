import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import CadastroDeTarefas from './components/CadastroDeTarefas/cadastroDeTarefas';
import Tasks from './components/Tasks/Tasks';

function App() {
  return (
    <div className="App">
      <Sidebar/>
      <CadastroDeTarefas/>
      <Tasks/>
    </div>
    
  );
}

export default App;
