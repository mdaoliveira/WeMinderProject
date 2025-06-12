import React, { useState, useEffect } from 'react';

function EditarTarefas({ tarefa, closeModal, setReloadCount }) {
    const [newTitulo, setNewTitulo] = useState('');
    const [newDescricao, setNewDescricao] = useState('');
    const [newData, setNewData] = useState('');
    const [prioridade, setPrioridade] = useState('');
    const [subtarefas, setSubtarefas] = useState([]);

    const updateTask = async () => {
        const response = await fetch(`http://localhost:8800/tarefas/${tarefa.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify()
        });

    };

     return (
         <div className="edicao-tarefas">
            <h2 className="titulo-div">Editar Tarefa</h2>
            <form onSubmit={updateTask}>
                <label className="content-cadastro">Título</label>
                <input type="text" value={newTitulo} onChange={(e) => setNewTitulo(e.target.value)} />
                <br />

                <label className="content-cadastro">Descrição:</label>
                <input type="text" value={newDescricao} onChange={(e) => setNewDescricao(e.target.value)} />
                <br />

                <label className="content-cadastro">Data:</label>
                <input type="date" value={newData} onChange={(e) => setNewData(e.target.value)} />
                <br />
            
                {/*tarefa.is_complex && (
                    <div>
                    </div>
                )*/}                 

                <br />
                <div className="botoes">
                    <button type="submit" onClick={updateTask}>Salvar</button>
                    <button type="button" onClick={closeModal}>Cancelar</button>
                </div>
            </form>
         </div>
     );
}

export default EditarTarefas;
