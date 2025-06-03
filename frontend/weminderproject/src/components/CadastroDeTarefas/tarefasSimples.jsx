import React, {useState, useEffect} from "react";

function TarefasSimples({onChange}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [due_date, setDueDate] = useState("");
    const [priority, setPriority] = useState("");

    // Sempre que algo mudar, envia os dados para o pai
    useEffect(() => {
        onChange({
            title,
            description,
            due_date,
            priority: priority === "" ? "" : parseInt(priority),
        });
    }, [title, description, due_date, priority, onChange]);

    return (
        <div className="cadastro-tarefa">
            <h2 className="titulo-div">Criar Tarefa Simples</h2>
            <label className="content-cadastro">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
            <br/>

            <label className="content-cadastro">Descrição</label>
            <input type="text"  value={description} onChange={(e) => setDescription(e.target.value)}/>
            <br/>

            <label className="content-cadastro">Data</label>
            <input type="date"  value={due_date} onChange={(e) => setDueDate(e.target.value)} />
            <br/>

            <label>
                <input type="radio" name="priority" value="" checked={priority === ""} onChange={(e) => setPriority("")} />
                    Sem Prioridade
            </label>
            <br/>
            <label>
                <input type="radio" name="priority" value={1} checked={priority === 1} onChange={(e) => setPriority(parseInt(e.target.value))} />
                    Prioridade Alta
            </label>
            <br/>
            <label>
                <input type="radio" name="priority" value={2} checked={priority === 2} onChange={(e) => setPriority(parseInt(e.target.value))} />
                    Prioridade Média
            </label>
            <br/>
            <label>
                <input type="radio" name="priority" value={3} checked={priority === 3} onChange={(e) => setPriority(parseInt(e.target.value))} />
                    Prioridade Baixa
            </label>
            <br/>
        </div>
    );
}

export default TarefasSimples;