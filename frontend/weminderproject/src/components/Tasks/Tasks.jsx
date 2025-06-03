import { useEffect, useState, useMemo } from "react";

const isToday = (someDate) => {
    const today = new Date();
    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    );
};



const Tasks = () => {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [itemClicked, setItemClicked] = useState(null);
    const[data, setData] = useState([]);
    
    useEffect(() => {
    fetch("http://localhost:8800/tarefas")
        .then((response) => response.json())
        .then((data) => {
            console.log("Dados ", data);
            setData(data);
        })
        .catch((error) => {
            console.error("ERROU ", error);
        });
    }, []);
    const todayTasks = useMemo(() => {
        return data.filter((item) => {
            const dueDate = new Date(item.due_date);
            return isToday(dueDate);
        });
    }, [data]);

    function clicked(item) {
        console.log("Clicou no item", item.id);
        setModalIsOpen(true);
        setItemClicked(item);
    }

    function closeModal() {
        setModalIsOpen(false);
        setItemClicked(null);
    }
 
    return(
        <div className="content">
            {todayTasks.map((item) => (
            <>
            <h1 className="data">
            {new Date(item.due_date).toLocaleDateString('pt-BR',{day: 'numeric', month: 'long', year: 'numeric'})}
            </h1>
            <div className="task_box">
                <div className="task_title"><h2>Título: {item.title}</h2></div>
                <div className="task_desc"><p>Descrição: {item.description} </p></div>
                <img src="/images/button.png" className="button_more" alt="Mais informações" onClick={() => clicked(item)}></img>
            </div>
            </>
            ))}

            <div>
                <data clicked={clicked}/>

                {modalIsOpen && itemClicked && (
                    <div className="modal">
                        <div className="modal-content">
                            <h1><b>Detalhes da Tarefa</b></h1>
                            <p><strong>Título: </strong> {itemClicked.title}</p>
                            <p><strong>Descrição: </strong> {itemClicked.description}</p>
                            <button onClick={closeModal}>Fechar</button>
                        </div>
                    </div>
            )}
            </div>

        </div>

        
        
    );
}

export default Tasks;