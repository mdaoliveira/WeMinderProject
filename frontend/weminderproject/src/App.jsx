import './index.css';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Tasks from './components/Tasks/Tasks';

function App() {
  return (
    <div className="App">
      <Sidebar/>
      <Tasks/>
    </div>
  );
}

export default App;
