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
  const {
    title,
    description,
    priority,
    due_date,
    is_completed,
    is_complex,
    subtasks,
    position,
    is_daily
  } = req.body;

  // Define tipo e query da tabela filha
  let type = "simple";
  let qTypeTask = "INSERT INTO simpleTasks (id) VALUES (?)";
  if (is_complex) {
    type = "complex";
    qTypeTask = "INSERT INTO complexTasks (id) VALUES (?)";
  }

  // Inserir na tabela base
  const qTask = `
    INSERT INTO tasks (title, description, priority, due_date, is_completed, position, is_daily, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    title,
    description,
    priority,
    due_date,
    is_completed || false,
    position,
    is_daily,
    type
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
      position,
      is_daily,
      type,
      subtasks: subtasks || []
    };

    // Inserir na tabela filha (simpleTasks ou complexTasks)
    db.query(qTypeTask, [taskId], (errType) => {
      if (errType) return res.status(500).json(errType);

      // Se for complexa e tiver subtarefas, insere as subtarefas
      if (is_complex && subtasks && subtasks.length > 0) {
        const qSubtask = `
          INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
          VALUES ?
        `;
        const subtaskValues = subtasks.map((sub) => [
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
      } else {
        // Se for simples ou complexa sem subtarefas
        return res.status(201).json(createdTask);
      }
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
export const editTask = (req, res) => {
    const taskId = req.params.id;
    const {
        title,
        description,
        priority,
        due_date,
        is_completed,
        is_complex,
    } = req.body;

    const updateTaskQ = `
        UPDATE tasks SET title=?, description=?, priority=?, due_date=?, is_completed=?, type=?
        WHERE id=?
    `;
    const taskValues = [title, description, priority, due_date, is_completed || false, type, taskId];

    db.query(updateTaskQ, taskValues, (err) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });

        if (!is_complex || !Array.isArray(subtasks)) {
            return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
        }
    });
}


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