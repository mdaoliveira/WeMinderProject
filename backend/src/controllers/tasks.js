import { db } from "../database/db.js";

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

export const postTask = (req, res) => {
    const {title, description, priority, due_date, is_completed, is_complex, is_daily, subtasks} = req.body;
    const qTask = `INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex, is_daily)
    VALUES(?,?,?,?,?,?)`;
    const values = [title, description, priority, due_date, is_completed || false, is_complex || false, is_daily || false];
    
    db.query(qTask, values, (err, result) => {
        if (err) return res.status(500).json(err);
        const taskId = result.insertId;
        const createdTask = {id: taskId, title, description, priority, due_date, is_completed, is_complex, is_daily, subtasks};
        if (!is_complex || !subtasks || subtasks.length === 0){
            return res.status(201).json(createdTask);
        }

        // subtarefas
        const qSubtask =  `INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
            VALUES ?`;

        const subtaskValues = subtasks.map(sub => [
            taskId,
            sub.title,
            sub.description || null,
            sub.priority,
            sub.due_date,
            sub.is_completed || false
        ]);

        db.query(qSubtask, [subtaskValues], (err2) => {
            if (err2) return res.status(500).json(err2);
            return res.status(201).json(createdTask);
        });
    });
};


export const deleteTask = (req, res) => {
  const taskId = req.params.id;
  const deleteSubtasksQ = "DELETE FROM subtasks WHERE parent_task_id = ?";

  db.query(deleteSubtasksQ, [taskId], (err) => {
    if (err) return res.sendStatus(500);
    const deleteTaskQ = "DELETE FROM tasks WHERE id = ?";

    db.query(deleteTaskQ, [taskId], (err2) => {
      if (err2) return res.sendStatus(500);
      return res.status(200).json({ message: "Tarefa excluída com sucesso" });
    });
  });
};


export const getColor = (req, res) => {
    const q = "SELECT text_color, sidebar_color, background_color, card_color, card_position FROM personalizacao WHERE id = 1";
    db.query(q, (err, results) => {
        if (err) return res.status(500);
        res.json({color: results[0].text_color, sidebar: results[0].sidebar_color, 
            background: results[0].background_color, card: results[0].card_color, card_position: results[0].card_position});
    });
};

export const updateColor = (req, res) => {
    const { color, sidebar, background, card, card_position} = req.body;
    const q = "UPDATE personalizacao SET text_color = ?, sidebar_color = ?, background_color = ?, card_color = ?, card_position = ? WHERE id = 1";
    db.query(q, [color, sidebar, background, card, card_position], (err) => {
        if (err) return res.status(500);
        res.json({color, card_position});
    });
};