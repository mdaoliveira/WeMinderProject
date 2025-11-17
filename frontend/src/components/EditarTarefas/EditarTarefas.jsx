import React, { useState, useEffect } from 'react';

function EditarTarefas({ itemClicked, closeModal, setReloadCount }) {
    const [newTitulo, setNewTitulo] = useState('');
    const [newDescricao, setNewDescricao] = useState('');
    const [newData, setNewData] = useState('');
    const [prioridade, setPrioridade] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [subtarefas, setSubtarefas] = useState([]);

    useEffect(() => {
        if (!itemClicked) return;
        setNewTitulo(itemClicked.title || '');
        setNewDescricao(itemClicked.description || '');
        setNewData(itemClicked.due_date ? itemClicked.due_date.slice(0, 10) : '');
        setPrioridade(itemClicked.priority || 0);
        setIsCompleted(itemClicked.is_completed || false);
        setSubtarefas(itemClicked.subtasks || []);
    }, [itemClicked]);

    const updateTask = async (e) => {
        e.preventDefault();
        if (!itemClicked) return;

        // Obter user_id do localStorage ou usar um valor padrão (1) para testes
        // Em produção, isso deve vir do sistema de autenticação
        const userId = localStorage.getItem('userId') || 1;

        const payload = {
            title: newTitulo,
            description: newDescricao,
            due_date: newData,
            priority: prioridade,
            is_completed: isCompleted,
            subtarefas: subtarefas,
            user_id: parseInt(userId)
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

                <label className="content-cadastro" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <input 
                        type="checkbox" 
                        checked={isCompleted} 
                        onChange={(e) => setIsCompleted(e.target.checked)}
                        style={{ width: '1.2rem', height: '1.2rem' }}
                    />
                    <span>Marcar como concluída</span>
                </label>
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
