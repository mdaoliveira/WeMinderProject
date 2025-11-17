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
export const editSubtask = (req, res) => {
  const subtaskId = req.params.id;
  const { due_date } = req.body;

  if (!due_date) {
    return res.status(400).json({ message: "Data é obrigatória" });
  }

  const updateSubtaskQ = `
        UPDATE subtasks SET due_date=?
        WHERE id=?
    `;
  const subtaskValues = [due_date, subtaskId];

  db.query(updateSubtaskQ, subtaskValues, (err) => {
    if (err) {
      console.error("Erro ao atualizar subtarefa:", err);
      return res
        .status(500)
        .json({ message: "Erro ao atualizar subtarefa", error: err.message });
    }
    return res
      .status(200)
      .json({ message: "Subtarefa atualizada com sucesso" });
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
        subtasks
    } = req.body;

    // Construir query dinamicamente com apenas os campos fornecidos
    const updates = [];
    const values = [];

    if (title !== undefined) {
        updates.push("title=?");
        values.push(title);
    }
    if (description !== undefined) {
        updates.push("description=?");
        values.push(description);
    }
    if (priority !== undefined) {
        updates.push("priority=?");
        values.push(priority);
    }
    if (due_date !== undefined) {
        updates.push("due_date=?");
        values.push(due_date);
    }
    if (is_completed !== undefined) {
        updates.push("is_completed=?");
        values.push(is_completed);
    }

    // Se nenhum campo foi fornecido, retorna erro
    if (updates.length === 0) {
        return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    values.push(taskId);

    const updateTaskQ = `UPDATE tasks SET ${updates.join(", ")} WHERE id=?`;

    db.query(updateTaskQ, values, (err) => {
        if (err) {
            console.error("Erro ao atualizar tarefa:", err);
            return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err.message });
        }

        // Se for complexa e tiver subtarefas, atualiza as subtarefas
        if (is_complex && Array.isArray(subtasks) && subtasks.length > 0) {
            const updateSubtaskQ = `
                UPDATE subtasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
                WHERE id=?
            `;
            let completed = 0;
            subtasks.forEach((sub) => {
                const subValues = [sub.title, sub.description || null, sub.priority, sub.due_date, sub.is_completed || false, sub.id];
                db.query(updateSubtaskQ, subValues, (err2) => {
                    if (err2) console.error("Erro ao atualizar subtarefa:", err2);
                    completed++;
                    if (completed === subtasks.length) {
                        return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
                    }
                });
            });
        } else {
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

export const getRelatorioTarefasConcluidas = (req, res) => {
    const { dataInicio, dataFim } = req.query;

    let query = "SELECT * FROM tasks WHERE is_completed = 1";
    const params = [];

    if (dataInicio && dataFim) {
        query += " AND DATE(due_date) BETWEEN ? AND ?";
        params.push(dataInicio, dataFim);
    }

    query += " ORDER BY due_date ASC, priority ASC";

    db.query(query, params, (err, tarefas) => {
        if (err) {
            console.error("Erro ao gerar relatório:", err);
            return res.status(500).json({ message: "Erro ao gerar relatório", error: err.message });
        }

        const resumo = {
            total: tarefas.length,
            porPrioridade: {
                baixa: tarefas.filter(t => t.priority === 1).length,
                media: tarefas.filter(t => t.priority === 2).length,
                alta: tarefas.filter(t => t.priority === 3).length,
            },
            dataGeracao: new Date().toLocaleDateString("pt-BR"),
            intervalo: dataInicio && dataFim ? `${dataInicio} até ${dataFim}` : "Todas as tarefas"
        };

        return res.status(200).json({
            resumo,
            tarefas
        });
    });
};