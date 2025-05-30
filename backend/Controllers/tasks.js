import { db } from "../db.js";

export const getTasks = (req, res) => {
    const qTasks = "SELECT * FROM tasks";
    const qSubtasks = "SELECT * FROM subtasks";

    db.query(qTasks, (err, tasks) => {
        if (err) return res.status(500).json("Erro de servidor!");
        db.query(qSubtasks, (err2, subtasks) => {
            if (err2) return res.status(500).json("Erro de servidor!");
            const data = tasks.map((task) => {
                const existSubtasks = subtasks.filter(
                    (sub) => sub.parent_task_id === task.id
                );
                return { ...task, subtasks: existSubtasks };
            });
            return res.status(200).json(data);
        });  
    });
}

