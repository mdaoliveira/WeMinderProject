import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

function Sidebar({
    inicioClick,
    cadastroClick,
    exibirClick,
    agendaClick,
    configClick,
    pomodoroClicked,
}) {
    const location = useLocation();

    const getButtonClass = (path) => {
        const base = "w-full text-left rounded-md px-3 py-2 transition-colors duration-200";
        const inactive =
            "hover:text-[color:var(--text-color)] dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700";
        return location.pathname === path ? `${base}` : `${base} ${inactive}`;
    };

    return (
        <aside
            className="z-30 w-64 h-screen flex-col hidden lg:flex 
  bg-[color:var(--sidebar-color)] dark:bg-gray-900 shadow-[4px_0_10px_rgba(0,0,0,0.3)]"
        >
            <div
                className="py-6 bg-[color:var(--sidebar-color)] font-medium  dark:text-gray-300 flex flex-col h-full"
                style={{ color: "var(--text-color)" }}
            >
                {/* Container da logo + botões */}
                <div>
                    <div className="flex justify-center mb-10">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="cursor-pointer w-28 h-auto"
                            onClick={inicioClick}
                        />
                    </div>

                    <ul className="flex flex-col space-y-3 px-6 text-[18px]">
                        <li>
                            <button onClick={inicioClick} className={getButtonClass("/")}>
                                Página Inicial
                            </button>
                        </li>
                        <li>
                            <button onClick={cadastroClick} className={getButtonClass("/cadastro")}>
                                Cadastro de Tarefas
                            </button>
                        </li>
                        <li>
                            <button onClick={exibirClick} className={getButtonClass("/exibir")}>
                                Exibir Tarefas
                            </button>
                        </li>
                        <li>
                            <button onClick={agendaClick} className={getButtonClass("/agenda")}>
                                Agenda
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={pomodoroClicked}
                                className={getButtonClass("/pomodoro")}
                            >
                                Pomodoro
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={configClick}
                                className={getButtonClass("/configuracoes")}
                            >
                                Configurações
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Botão Sair na base */}
                <div className="px-6 mt-auto mb-6 flex justify-center">
                    <button className="flex items-center space-x-3 hover:text-red-600 transition-colors duration-200 cursor-pointer">
                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-2xl" />
                        <span className="text-[18px] font-medium">Sair</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
