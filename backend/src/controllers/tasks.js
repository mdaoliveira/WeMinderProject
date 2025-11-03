import { db } from "../database/db.js";

export const getTasks = (req, res) => {
    const qSimpleTasks = "SELECT * FROM simpleTasks";
    const qComplexTasks = "SELECT * FROM complexTasks";
    const qSubtasks = "SELECT * FROM subTasks";

    db.query(qSimpleTasks, (errSimple, simpleTasks) => {
        if (errSimple) return res.status(500).json("Erro de servidor!");

        db.query(qComplexTasks, (errComplex, complexTasks) => {
            if (errComplex) return res.status(500).json("Erro de servidor!");

            db.query(qSubtasks, (errSub, subtasks) => {
                if (errSub) return res.status(500).json("Erro de servidor!");

                const complexWithSubtasks = complexTasks.map((task) => {
                    const relatedSubtasks = subtasks.filter(
                        (sub) => sub.parent_task_id === task.id
                    );
                    return { ...task, subtasks: relatedSubtasks };
                });

                const allTasks = [
                    ...simpleTasks.map((t) => ({ ...t, type: "simple" })),
                    ...complexWithSubtasks.map((t) => ({ ...t, type: "complex" })),
                ];

                return res.status(200).json(allTasks);
            });
        });
    });
};

export const postTask = (req, res) => {
    const { title, description, priority, due_date, is_completed, is_complex, subtasks, position } =
        req.body;
    if(is_complex){
        const qTask = `INSERT INTO complexTasks (title, description, priority, due_date, is_completed, position)
        VALUES(?,?,?,?,?,?)`;  
        const values = [
            title,
            description,
            priority,
            due_date,
            is_completed || false,
            position,
        ];

        db.query(qTask, values, (err, result) => {
            if (err) return res.status(500).json(err);
            const taskId = result.insertId;
            const createdTask = {
                id: taskId,
                title,
                description,
                priority,
                due_date,
                is_completed,
                subtasks,
                position,
            };
            if (!is_complex || !subtasks || subtasks.length === 0) {
                return res.status(201).json(createdTask);
            }
            // subtarefas
            const qSubtask = `INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
                VALUES ?`;
    
            const subtaskValues = subtasks.map((sub) => [
                taskId,
                sub.title,
                sub.description || null,
                sub.priority,
                sub.due_date,
                sub.is_completed || false,
            ]);
    
            db.query(qSubtask, [subtaskValues], (err2) => {
                if (err2) return res.status(500).json(err2);
                return res.status(201).json(createdTask);
            });      
        });
    }
    else{
        const qTask = `INSERT INTO simpleTasks (title, description, priority, due_date, is_completed, position)
            VALUES(?,?,?,?,?,?)`;     
        db.query(qTask, values, (err, result) => {
            if (err) return res.status(500).json(err);
            const taskId = result.insertId;
            const createdTask = {
                id: taskId,
                title,
                description,
                priority,
                due_date,
                is_completed,
                subtasks,
                position,
            };
            if (!is_complex || !subtasks || subtasks.length === 0) {
                return res.status(201).json(createdTask);
            }
        }); 
    }
    
};

export const deleteTask = (req, res) => {
    const taskId = req.params.id;
    const taskSub = req.params.subtasks;
    console.log(taskSub);
    if(taskSub){
        const deleteSubtasksQ = "DELETE FROM subtasks WHERE parent_task_id = ?";
        db.query(deleteSubtasksQ, [taskId], (err) => {
        if (err) return res.sendStatus(500);
        const deleteTaskQ = "DELETE FROM complexTasks WHERE id = ?";

        db.query(deleteTaskQ, [taskId], (err2) => {
            if (err2) return res.sendStatus(500);
            return res.status(200).json({ message: "Tarefa excluída com sucesso" });
        });
    });
    }
    else{
        const deleteTaskQ = "DELETE FROM simpleTasks WHERE id = ?";
    
        db.query(deleteTaskQ, [taskId], (err2) => {
        if (err2) return res.sendStatus(500);
            return res.status(200).json({ message: "Tarefa excluída com sucesso" });
        });
    }

};

export const editTask = (req, res) => {
    const taskId = req.params.id;
    const { title, description, priority, due_date, is_completed, subtarefas } = req.body;

    if (subtarefas.length > 0) {
        const updateTaskQ = `
            UPDATE complexTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
            WHERE id=?
        `;
        const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
        db.query(updateTaskQ, taskValues, (err) => {
            if (err)
                return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });
        });
    }
    const updateTaskQ = `
        UPDATE simpleTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
        WHERE id=?
    `;
    const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
    db.query(updateTaskQ, taskValues, (err) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });
    });
};
