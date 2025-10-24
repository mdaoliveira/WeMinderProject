import "./index.css";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import CadastroDeTarefas from "./components/CadastroDeTarefas/cadastroDeTarefas";
import ExibirTarefas from "./components/ExibirTarefas/ExibirTarefas";
import Agenda from "./components/agenda/agenda";
import Tasks from "./components/Tasks/Tasks";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

function AppContent() {
    const [modalOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [itemClicked, setItemClicked] = useState(null);
    const [reloadCount, setReloadCount] = useState(0);

    const navigate = useNavigate();

    function clicked(item) {
        setModalIsOpen(true);
        setModalType("detalhes");
        setItemClicked(item);
    }

    function closeModal() {
        setModalIsOpen(false);
        setItemClicked(null);
        setModalType(null);
    }

    function cadastroClicked() {
        setModalType("cadastro");
        setModalIsOpen(true);
    }

    function exibirClicked() {
        navigate("/exibir");
    }

    function agendaClicked() {
        navigate("/agenda");
    }

    function inicioClicked() {
        navigate("/");
    }

    function ExcluirTarefas(id) {
        fetch(`http://localhost:8800/tarefas/${id}`, {
            method: "DELETE",
        })
            .then(() => {
                closeModal();
                setReloadCount((prev) => prev + 1);
            })
            .catch((error) => console.error("Erro ao deletar registro -> ", error));
    }

    const priorityLabels = {
        0: "Sem Prioridade",
        1: "Prioridade Alta",
        2: "Prioridade Média",
        3: "Prioridade Baixa",
    };

    return (
        <div className="App flex">
            <Sidebar
                inicioClick={inicioClicked}
                cadastroClick={cadastroClicked}
                exibirClick={exibirClicked}
                agendaClick={agendaClicked}
            />
            <main className="flex-1 min-h-screen overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
                {/* MODAL DE CADASTRO */}
                {modalOpen && modalType === "cadastro" && (
                    <div className="modal-show">
                        <CadastroDeTarefas
                            itemClicked={itemClicked}
                            closeModal={closeModal}
                            setReloadCount={setReloadCount}
                        />
                    </div>
                )}

                {/* Modal de Detalhes */}
                {modalOpen && modalType === "detalhes" && itemClicked && (
                    <div className="modal-show">
                        <div className="modal-content">
                            <h1>
                                <b>Detalhes da Tarefa</b>
                            </h1>
                            <p>
                                <strong>Título: </strong>
                                {itemClicked.title}
                            </p>
                            <p>
                                <strong>Descrição: </strong>
                                {itemClicked.description}
                            </p>
                            <p>
                                <strong>Prioridade: </strong>
                                {priorityLabels[itemClicked.priority]}
                            </p>

                            {itemClicked.subtasks && itemClicked.subtasks.length > 0 && (
                                <div className="mt-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Subtarefas
                                    </h2>
                                    {itemClicked.subtasks.map((sub, index) => (
                                        <div
                                            key={index}
                                            className="mb-4 border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-900"
                                        >
                                            <hr className="border-gray-300 dark:border-gray-700 mb-3" />
                                            <p className="text-gray-800 dark:text-gray-200 mb-1">
                                                <strong>Título: </strong>
                                                {sub.title}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300 mb-1">
                                                <strong>Descrição: </strong>
                                                {sub.description}
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                <strong>Data: </strong>
                                                {new Date(sub.due_date).toLocaleDateString(
                                                    "pt-BR",
                                                    {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => ExcluirTarefas(itemClicked.id)}
                                    className="bg-red-600 hover:bg-red-700 transition text-white font-semibold px-4 py-2 rounded"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Routes>
                    <Route
                        path="/"
                        element={<Tasks onTaskClicked={clicked} reloadPage={reloadCount} />}
                    />
                    <Route
                        path="/exibir"
                        element={<ExibirTarefas onTaskClicked={clicked} reloadPage={reloadCount} />}
                    />
                    <Route
                        path="/agenda"
                        element={<Agenda onTaskClicked={clicked} reloadPage={reloadCount} />}
                    />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
