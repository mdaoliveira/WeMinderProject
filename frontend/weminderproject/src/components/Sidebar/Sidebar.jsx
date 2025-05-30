import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Sidebar({cadastroClick}){
    return (
        <div className='relative flex h-screen w-full max-w-[20rem] flex-col bg-[#BADFE8] p-4 text-gray-700'>
        {/* Todo conteúdo */}
        <div className='flex flex-col items-center justify-center text-center'>
            <div className='mb-10'>
                <img src="/images/logo.png" alt="Logo" className='cursor-pointer'/>
                <h1 className="mt-2">Bem vindo(a), USERNAME</h1>
            </div>
            <div className='space-y-4 text-[25px] cursor-pointer'>
                <div className='botao-menu'>
                    <button onClick={cadastroClick}>
                        Cadastro de tarefas
                    </button>
                </div>
                <div className='botao-menu'>
                    <button onClick={() => console.log("testando o botão de exibir tarefas")}>
                        Exibir tarefas
                    </button>
                </div>
            </div>
            <button className='absolute bottom-2 flex items-center space-x-2 cursor-pointer'>
                <FontAwesomeIcon icon={faArrowRightFromBracket} className='text-2xl relative top-[2px]'/>
                <p className='text-[25px]'>Sair</p>
            </button>
        </div>
        </div>
    );
}

export default Sidebar;