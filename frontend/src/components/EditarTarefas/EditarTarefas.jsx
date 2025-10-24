import React, { useState, useEffect } from 'react';

function EditarTarefas({ itemClicked, closeModal, setReloadCount }) {
    const [newTitulo, setNewTitulo] = useState('');
    const [newDescricao, setNewDescricao] = useState('');
    const [newData, setNewData] = useState('');
    const [prioridade, setPrioridade] = useState('');
    const [subtarefas, setSubtarefas] = useState([]);

    useEffect(() => {
        if (!itemClicked) return;
        setNewTitulo(itemClicked.title || '');
        setNewDescricao(itemClicked.description || '');
        setNewData(itemClicked.due_date ? itemClicked.due_date.slice(0, 10) : '');
        setPrioridade(itemClicked.priority || 0);
    }, [itemClicked]);

    const updateTask = async (e) => {
        e.preventDefault();
        if (!itemClicked) return;

        const payload = {
            title: newTitulo,
            description: newDescricao,
            due_date: newData,
            priority: prioridade,
            is_completed: false,
        };

        const response = await fetch(`http://localhost:8800/tarefas/${itemClicked.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok){
            alert("Erro ao atualizar a tarefa.");
        }
        setReloadCount(prev => prev + 1);
        closeModal();
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
