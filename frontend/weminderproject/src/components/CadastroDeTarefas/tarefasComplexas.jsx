import { useState, useEffect } from 'react';

function TarefasComplexas({onChange}){
    const [title, setNewTitle] = useState("");
    const [description, setNewDescription] = useState("");
    const [due_date, setNewDueDate] = useState("");
    const [subtasks, setSubtasks] = useState([]);

    const adicionarSubtarefa = () => {
        setSubtasks([...subtasks, {title: "", description: "", due_date: ""}]);
    };

    const handleSubtarefaChange = (index, field, value) => {
    const novas = [...subtasks];
    novas[index] = { ...novas[index], [field]: value };
    setSubtasks(novas);
    };

    // mudanças para cadastrodetarefas
    useEffect(() => {
        if (onChange) {
        onChange({
            title,
            description,
            due_date,
            subtasks,
        });
        }
    }, [title, description, due_date, subtasks, onChange]);


    return(
        <div className="cadastro-tarefa">
            <h2 className="titulo-div">Criar Tarefa Complexa</h2>
            <label className="content-cadastro">Título</label>
            <input type="text" value={title} onChange={(e) => setNewTitle(e.target.value)}/>
            <br/>

            <label className="content-cadastro">Descrição</label>
            <input type="text" value={description} onChange={(e) => setNewDescription(e.target.value)}/>
            <br/>

            <label className="content-cadastro">Data</label>
            <input type="date" value={due_date} onChange={(e) => setNewDueDate(e.target.value)} />
            <br/>

            <div className="subtarefas-header">
                <h3 className="cadastro-subtarefas">Subtarefas</h3>
                <label className="cadastro-subtarefas adicionar-subtarefa">
                    <u onClick={adicionarSubtarefa}>Adicionar Subtarefa</u>
                    <img src="/images/plus symbol.png" className="plus-symbol"></img>
                </label>
            </div>
           
            {subtasks.map((sub, index) => (
                <div key={index}>  
                    <hr />
                    <label className="content-cadastro">Título</label>
                     <input type="text" value={sub.title} onChange={(e) => handleSubtarefaChange(index, "title", e.target.value)}/>
                    <br />

                    <label className="content-cadastro">Descrição</label>
                    <input type="text" value={sub.description} onChange={(e) => handleSubtarefaChange(index, "description", e.target.value)}/>
                    <br/>

                    <label className="content-cadastro">Data</label>
                    <input type="date" value={sub.due_date} onChange={(e) => handleSubtarefaChange(index, "due_date", e.target.value)}/>
                    <br/>
                </div>
            ))}

            <br/>
        </div>
    );
}

export default TarefasComplexas;