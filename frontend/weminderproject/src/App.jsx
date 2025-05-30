import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import CadastroDeTarefas from './components/CadastroDeTarefas/cadastroDeTarefas';
import Tasks from './components/Tasks/Tasks';

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
      <Tasks/>
      <CadastroDeTarefas/>
    </div>
    
  );
}

export default App;
