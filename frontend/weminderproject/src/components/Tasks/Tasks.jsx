import { useEffect, useState } from "react";

const Tasks = (props) => {
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
 
    return(
        <div className="content">
            {data.map((item) => (
            <>
            <h1 className="data">
            {new Date(item.due_date).toLocaleDateString('pt-BR',{day: 'numeric', month: 'long', year: 'numeric'})}
            </h1>
            <div className="task_box">
                <div className="task_title"><h2>Título: {item.title}</h2></div>
                <div className="task_desc"><p>Descrição: {item.description} </p></div>
                <img src="/images/button.png" className="button_more"></img>
            </div>
            </>
            ))}
        </div>
    );
}

export default Tasks;