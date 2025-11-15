import "./index.css";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import CadastroDeTarefas from "./components/CadastroDeTarefas/cadastroDeTarefas";
import EditarTarefas from "./components/EditarTarefas/EditarTarefas";
import ExibirTarefas from "./components/ExibirTarefas/ExibirTarefas";
import Agenda from "./components/Agenda/Agenda";
import Tasks from "./components/Tasks/Tasks";
import Configuracoes from "./components/Configuracoes/Configuracoes";
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import MapaInterativo from "./components/Mapa/Mapa";
import { useReactToPrint } from "react-to-print";

function AppContent() {
    const [modalOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [itemClicked, setItemClicked] = useState(null);
    const [reloadCount, setReloadCount] = useState(0);
    const [color, setColor] = useState(null);

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

    function configClicked() {
        setModalType("configuracoes");
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

    function ExcluirTarefas(id, subtarefas) {
        const payload = {
            subtarefas: subtarefas,
        };
        fetch(`http://localhost:8800/tarefas/${id}`, {
            method: "DELETE",
            body: JSON.stringify(payload),
        })
            .then(() => {
                closeModal();
                setReloadCount((prev) => prev + 1);
            })
            .catch((error) => console.error("Erro ao deletar registro -> ", error));
    }

    // obter os estilos do bd
    useEffect(() => {
        fetch("http://localhost:8800/color")
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    // atualizar CSS
                    if (data.color)
                        document.documentElement.style.setProperty("--text-color", data.color);
                    if (data.sidebar)
                        document.documentElement.style.setProperty("--sidebar-color", data.sidebar);
                    if (data.background)
                        document.documentElement.style.setProperty(
                            "--background-color",
                            data.background
                        );
                    if (data.card)
                        document.documentElement.style.setProperty("--card-color", data.card);
                    if (data.card_position)
                        document.documentElement.style.setProperty(
                            "--card-position",
                            data.card_position
                        );
                    if (data.color) setColor(data.color);
                }
            })
            .catch((error) => console.error(error));
    }, []);

    const priorityLabels = {
        0: "Sem Prioridade",
        1: "Prioridade Alta",
        2: "Prioridade Média",
        3: "Prioridade Baixa",
    };
    let coordenadas = null;

    if (itemClicked && itemClicked.position && typeof itemClicked.position === "string") {
        const parts = itemClicked.position.split(",").map((v) => v.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
                coordenadas = [lat, lng];
            }
        }
    }

    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    return (
        <div className="App flex">
            <Sidebar
                inicioClick={inicioClicked}
                cadastroClick={cadastroClicked}
                exibirClick={exibirClicked}
                agendaClick={agendaClicked}
                configClick={configClicked}
                defaultColor={color}
            />
            <main
                className="flex-1 min-h-screen overflow-auto p-6 bg-[color:var(--background-color)] dark:bg-gray-900"
                ref={contentRef}
            >
                <img
                    src="/images/print%20symbol.png"
                    className="w-14 h-14 text-black dark:text-white"
                    onClick={reactToPrintFn}
                ></img>
                {/* Modal de Cadastro */}
                {modalOpen && modalType === "cadastro" && (
                    <div className="modal-show">
                        <CadastroDeTarefas
                            itemClicked={itemClicked}
                            closeModal={closeModal}
                            setReloadCount={setReloadCount}
                        />
                    </div>
                )}

                {/* MODAL DE CONFIGURAÇÕES */}
                {modalOpen && modalType === "configuracoes" && (
                    <div className="modal-show">
                        <Configuracoes
                            itemClicked={itemClicked}
                            setColor={setColor}
                            closeModal={closeModal}
                        />
                    </div>
                )}

                {/* Modal de Detalhes */}
                {modalOpen && modalType === "detalhes" && itemClicked && (
                    <div className="modal-show">
                        <div className="modal-content text-[color:var(--text-color)]">
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
                            <p>
                                <strong>Repete diariamente: </strong>
                                {itemClicked.is_daily ? "Sim" : "Não"}
                            </p>

                            {itemClicked.subtasks && itemClicked.subtasks.length > 0 && (
                                <div className="mt-6 bg-[color:var(--card-color)]">
                                    <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
                                        Subtarefa
                                    </h2>
                                    {itemClicked.subtasks.map((sub, index) => (
                                        <div
                                            key={index}
                                            className="mb-4 border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-[color:var(--card-color)] dark:bg-gray-900"
                                        >
                                            <hr className="border-gray-300 dark:border-gray-700 mb-3" />
                                            <p className="dark:text-gray-200 mb-1">
                                                <strong>Título: </strong>
                                                {sub.title}
                                            </p>
                                            <p className="dark:text-gray-300 mb-1">
                                                <strong>Descrição: </strong>
                                                {sub.description}
                                            </p>
                                            <p className="dark:text-gray-300">
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

                            <div className="flex justify-between items-center pt-4 gap-4">
                                <button
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
                                <button
                                    onClick={() => {
                                        setModalType("editar");
                                        setModalIsOpen(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold px-4 py-2 rounded"
                                >
                                    Editar
                                </button>
                            </div>

                            <MapaInterativo
                                localSalvo={coordenadas}
                                mostrarBotao={true}
                                onPositionChange={(coords) => {
                                    // Posição pode ser atualizada aqui no futuro se necessário
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Modal de Edição */}
                {modalOpen && modalType === "editar" && itemClicked && (
                    <div className="modal-show">
                        <EditarTarefas
                            itemClicked={itemClicked}
                            closeModal={closeModal}
                            setReloadCount={setReloadCount}
                        />
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
