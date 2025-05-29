import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

function Sidebar(){
    return (
        <div className='relative flex h-screen w-full max-w-[20rem] flex-col bg-[#BADFE8] p-4 text-gray-700'>
        {/* Todo conteúdo */}
        <div className='flex flex-col items-center justify-center text-center'>
            <div className='mb-10'>
                <img src="/images/logo.png" alt="Logo" className='cursor-pointer'/>
                <h1 className="mt-2">Bem vindo(a), USERNAME</h1>
            </div>
            <div className='space-y-4 text-[25px] cursor-pointer'>
                <h1 href="../CadastroDeTarefas/cadastroDeTarefas.jsx">Cadastro de tarefas</h1>
                <h1>Exibir tarefas</h1>
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