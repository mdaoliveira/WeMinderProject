import React, {useState} from "react";
import TarefasSimples from "./tarefasSimples";
import TarefasComplexas from "./tarefasComplexas";

function CadastroDeTarefas({ closeModal, setReloadCount }) {
  const [tipoTarefa, setTipoTarefa] = useState(''); // mantém o radio selecionado
  const [simpleTask, setSimpleTask] = useState({});
  const [complexTask, setComplexTask] = useState({});

  function handleTipoTarefa(e) {
    setTipoTarefa(e.target.value);
  }

  const validateForm = (data) => {
    const { title, description, due_date, subtasks, is_complex } = data;
    if (!title || !description || !due_date ) {
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
      const { title, description, due_date, priority, position } = simpleTask;

      // Passa is_complex para validar corretamente
      if (!validateForm({ title, description, due_date, priority, is_complex: false, position })) return;

      data = {
        title,
        description,
        due_date,
        priority: parseInt(priority),
        is_completed: false,
        is_complex: false,
        position,
      };
    } else if (tipoTarefa === "complexa") {
      const { title, description, due_date, priority, subtasks, position } = complexTask;

      // Passa is_complex = true para validar subtarefas
      if (!validateForm({ title, description, due_date, priority, subtasks,position, is_complex: true })) return;

      data = {
        title,
        description,
        due_date,
        priority: parseInt(priority),
        is_completed: false,
        is_complex: true,
        subtasks,
        position,
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
        setReloadCount(prev => prev + 1);
      })
      .catch((error) => console.error("Erro ao criar tarefa:", error));
  };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <form
          onSubmit={addTask}
          className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 overflow-auto max-h-[90vh]"
        >
          <div className="flex flex-col space-y-4">
            <div>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="tipoTarefa"
                  value={"simples"}
                  checked={tipoTarefa === "simples"}
                  onChange={handleTipoTarefa}
                  className="form-radio"
                />
                <span className="ml-2">Tarefas Simples</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="tipoTarefa"
                  value={"complexa"}
                  checked={tipoTarefa === "complexa"}
                  onChange={handleTipoTarefa}
                  className="form-radio"
                />
                <span className="ml-2">Tarefas Complexas</span>
              </label>
            </div>

            {tipoTarefa === "simples" && <TarefasSimples onChange={setSimpleTask} />}
            {tipoTarefa === "complexa" && <TarefasComplexas onChange={setComplexTask} />}

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </form>
      </div>
    );
}
export default CadastroDeTarefas;

