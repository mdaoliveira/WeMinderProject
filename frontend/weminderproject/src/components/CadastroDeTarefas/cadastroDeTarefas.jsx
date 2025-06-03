import React, {useState} from "react";
import TarefasSimples from "./tarefasSimples";
import TarefasComplexas from "./tarefasComplexas";

function CadastroDeTarefas({ closeModal }) {
  const [tipoTarefa, setTipoTarefa] = useState(''); // mantém o radio selecionado
  const [simpleTask, setSimpleTask] = useState({});
  const [complexTask, setComplexTask] = useState({});

  function handleTipoTarefa(e) {
    setTipoTarefa(e.target.value);
  }

  const validateForm = (data) => {
    const { title, description, due_date, priority, subtasks, is_complex } = data;

    if (!title || !description || !due_date) {
      alert("Todos os campos devem ser preenchidos!");
      return false;
    }

    if (is_complex) {
      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        alert("Tarefa complexa precisa de ao menos uma subtarefa.");
        return false;
      }

        // Validar cada subtarefa
        for (let i = 0; i < subtasks.length; i++) {
            const sub = subtasks[i];
            if (!sub.title || !sub.description || !sub.due_date) {
                alert(`A subtarefa ${i + 1} precisa ter título, descrição e data preenchidos!`);
                return false;
            }
        }
    }


    return true;
  };

  const addTask = (e) => {
    e.preventDefault();

    let data = {};

    if (tipoTarefa === "simples") {
      const { title, description, due_date, priority } = simpleTask;

      // Passa is_complex para validar corretamente
      if (!validateForm({ title, description, due_date, priority, is_complex: false })) return;

      data = {
        title,
        description,
        due_date,
        priority: parseInt(priority),
        is_completed: false,
        is_complex: false,
      };
    } else if (tipoTarefa === "complexa") {
      const { title, description, due_date, subtasks } = complexTask;

      // Passa is_complex = true para validar subtarefas
      if (!validateForm({ title, description, due_date, subtasks, is_complex: true })) return;

      data = {
        title,
        description,
        due_date,
        is_completed: false,
        is_complex: true,
        subtasks,
      };
    } else {
      alert("Selecione o tipo de tarefa!");
      return;
    }

    fetch("http://localhost:8800/tarefas", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(() => {
        setTipoTarefa("");
        setSimpleTask({});
        setComplexTask({});
        closeModal();
      })
      .catch((error) => console.error("Erro ao criar tarefa:", error));
  };

    return(
        <div className="cadastro-tarefas">
            <form onSubmit={addTask}>
                <label>
                    <input type="radio" name="tipoTarefa" value={"simples"} checked={tipoTarefa === 'simples'} onChange={handleTipoTarefa}/>
                    Tarefas Simples
                </label>
                <br></br>
                <label>
                    <input type="radio" name="tipoTarefa" value={"complexa"} checked={tipoTarefa === 'complexa'} onChange={handleTipoTarefa} />
                    Tarefas Complexas
                </label>
                {/*Colocando o componente conforme "solicitado" pelo usuário*/}
                {tipoTarefa === 'simples' && <TarefasSimples onChange={setSimpleTask}/>}
                {tipoTarefa === 'complexa' && <TarefasComplexas onChange={setComplexTask}/>}
                <div className="botoes">
                <button onClick={closeModal}>Fechar</button>
                <button type="submit"> Cadastrar</button>
                </div>
            </form>

        </div>
    );
}
export default CadastroDeTarefas;

