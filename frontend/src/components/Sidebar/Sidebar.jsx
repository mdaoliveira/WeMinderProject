import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

function Sidebar({ inicioClick, cadastroClick, exibirClick, agendaClick }) {
    const location = useLocation();

    const getButtonClass = (path) => {
        const base = "w-full text-left rounded-md px-3 py-2 transition-colors duration-200";
        const active =
            "text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900";
        const inactive =
            "hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700";
        return location.pathname === path ? `${base} ${active}` : `${base} ${inactive}`;
    };

    return (
        <aside className="z-30 w-56 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg hidden lg:flex flex-col h-screen">
            <div className="py-6 text-gray-600 dark:text-gray-300 flex flex-col h-full">
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
