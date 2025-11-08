
function Card(tarefa, onTaskClicked){
    return(
        <div
          key={tarefa.id}
          className="bg-[color:var(--card-color)] text-[color:var(--text-color)] dark:bg-gray-800 shadow-[0_0_4px_1px_rgba(0,0,0,0.7)]
               rounded-lg p-4 mb-6 w-full max-w-xl flex justify-between items-center cursor-pointer" onClick={() => onTaskClicked(tarefa)}>
          <div className="flex flex-col max-w-[85%]">
            <h2 className="dark:text-gray-100 font-semibold text-lg mb-2 truncate">
              Título: {tarefa.title}
            </h2>
            <p className="dark:text-gray-300 truncate">
              Descrição: {tarefa.description}
            </p>
          </div>
          <img src="/images/olho.png" alt="Mais informações" className="h-8 w-8 cursor-pointer ml-4" onClick={(e) => {
              e.stopPropagation(); // evitar disparar onClick do card
              onTaskClicked(tarefa);
            }}
          />
        </div>
    );
}
export default Card