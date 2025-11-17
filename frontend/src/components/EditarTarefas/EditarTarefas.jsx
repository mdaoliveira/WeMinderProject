import React, { useState, useEffect } from "react";

function EditarTarefas({ itemClicked, closeModal, setReloadCount }) {
    const [newTitulo, setNewTitulo] = useState("");
    const [newDescricao, setNewDescricao] = useState("");
    const [newData, setNewData] = useState("");
    const [prioridade, setPrioridade] = useState("");

    useEffect(() => {
        if (!itemClicked) return;

        const targetItem = itemClicked._clickedSubtask || itemClicked;

        setNewTitulo(targetItem.title || "");
        setNewDescricao(targetItem.description || "");
        setNewData(targetItem.due_date ? targetItem.due_date.slice(0, 10) : "");
        setPrioridade(targetItem.priority || 0);
    }, [itemClicked]);

    const updateTask = async (e) => {
        e.preventDefault();

        if (itemClicked._clickedSubtask) {
            const subtask = itemClicked._clickedSubtask;
            const payload = {
                title: newTitulo,
                description: newDescricao,
                due_date: newData,
                priority: prioridade,
                is_completed: subtask.is_completed || false,
            };

            fetch(`http://localhost:8800/subtarefas/${subtask.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
                .then(() => {
                    closeModal();
                    setReloadCount((prev) => prev + 1);
                })
                .catch((error) => console.error("Erro ao atualizar subtarefa -> ", error));
        } else {
            const payload = {
                title: newTitulo,
                description: newDescricao,
                due_date: newData,
                priority: prioridade,
                is_completed: itemClicked.is_completed || false,
            };

            fetch(`http://localhost:8800/tarefas/${itemClicked.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
                .then(() => {
                    closeModal();
                    setReloadCount((prev) => prev + 1);
                })
                .catch((error) => console.error("Erro ao atualizar tarefa -> ", error));
        }
    };

    return (
        <div className="edicao-tarefas">
            <h2 className="titulo-div">Editar Tarefa</h2>
            <form onSubmit={updateTask}>
                <label className="content-cadastro">Título</label>
                <input
                    type="text"
                    value={newTitulo}
                    onChange={(e) => setNewTitulo(e.target.value)}
                />
                <br />

                <label className="content-cadastro">Descrição:</label>
                <input
                    type="text"
                    value={newDescricao}
                    onChange={(e) => setNewDescricao(e.target.value)}
                />
                <br />

                <label className="content-cadastro">Data:</label>
                <input type="date" value={newData} onChange={(e) => setNewData(e.target.value)} />
                <br />

                <br />
                <div className="botoes">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={closeModal}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditarTarefas;
