import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";

function toDateOnlyISO(value) {
    const d = new Date(value);
    if (isNaN(d)) return null;
    return d.toISOString().slice(0, 10);
}

function buildEventsFromTasks(tasks) {
    console.log("🔨 Construindo eventos a partir de", tasks.length, "tarefas");
    const out = [];
    for (const t of tasks) {
        const date = toDateOnlyISO(t.due_date);
        if (date) {
            const event = {
                id: `task-${t.id}`,
                title: t.title,
                start: date,
                allDay: true,
                extendedProps: { type: "task", task: t },
            };
            out.push(event);
            console.log("  ✅ Evento criado:", event.id, "-", event.title, "-", date);
        } else {
            console.log("  ⚠️ Tarefa sem data válida:", t.id, "-", t.title, "-", t.due_date);
        }
        if (Array.isArray(t.subtasks)) {
            for (const s of t.subtasks) {
                const subDate = toDateOnlyISO(s.due_date);
                if (!subDate) {
                    console.log("  ⚠️ Subtarefa sem data válida:", s.id || s.title);
                    continue;
                }
                const subEvent = {
                    id: s.id ? `sub-${s.id}` : `sub-${t.id}-${s.title}`,
                    title: `${t.title} — ${s.title}`,
                    start: subDate,
                    allDay: true,
                    extendedProps: { type: "subtask", task: t, subtask: s },
                };
                out.push(subEvent);
                console.log("  ✅ Subtarefa criada:", subEvent.id, "-", subEvent.title, "-", subDate);
            }
        }
    }
    console.log("🔨 Total de eventos construídos:", out.length);
    return out;
}

const Agenda = ({ onTaskClicked, reloadPage }) => {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef(null);

    useEffect(() => {
        console.log("📥 useEffect: Carregando tarefas do backend...");
        fetch("http://localhost:8800/tarefas")
            .then((r) => r.json())
            .then((data) => {
                console.log("📥 useEffect: Dados recebidos:", data.length, "tarefas");
                const events = buildEventsFromTasks(Array.isArray(data) ? data : []);
                console.log("📥 useEffect: Definindo", events.length, "eventos no estado");
                setEvents(events);
            })
            .catch((error) => {
                console.error("📥 useEffect: Erro ao carregar tarefas:", error);
                setEvents([]);
            });
    }, [reloadPage]);

    async function handleEventDrop(info) {
        console.log("=== DRAG AND DROP INICIADO ===");
        const { event } = info;
        const { type, task, subtask } = event.extendedProps || {};
        const newDate = event.start ? toDateOnlyISO(event.start) : null;

        console.log("Evento arrastado:", {
            id: event.id,
            title: event.title,
            type,
            taskId: task?.id,
            subtaskId: subtask?.id,
            dataAntiga: event.extendedProps?.task?.due_date || event.extendedProps?.subtask?.due_date,
            dataNova: newDate,
        });

        if (!newDate) {
            console.warn("Data inválida, revertendo...");
            info.revert();
            return;
        }

        try {
            let response;
            
            if (type === "subtask" && subtask?.id) {
                console.log("Atualizando subtarefa:", subtask.id);
                // Atualizar subtarefa
                response = await fetch(`http://localhost:8800/subtarefas/${subtask.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ due_date: newDate }),
                });

                console.log("Resposta subtarefa:", {
                    ok: response.ok,
                    status: response.status,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
                    console.error("Erro na resposta subtarefa:", errorData);
                    throw new Error(errorData.message || "Erro ao atualizar subtarefa");
                }
            } else if (type === "task" && task?.id) {
                console.log("Atualizando tarefa:", task.id, "Tipo:", task.type);
                // Atualizar tarefa (simples ou complexa)
                const payload = {
                    title: task.title || "",
                    description: task.description || null,
                    priority: task.priority || 0,
                    due_date: newDate,
                    is_completed: task.is_completed || false,
                };

                // Se for tarefa complexa, incluir subtarefas
                if (task.type === "complex" && Array.isArray(task.subtasks)) {
                    payload.subtarefas = task.subtasks;
                    console.log("Tarefa complexa com", task.subtasks.length, "subtarefas");
                }

                console.log("Payload enviado:", payload);

                response = await fetch(`http://localhost:8800/tarefas/${task.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json().catch(() => ({}));
                console.log("Resposta tarefa:", {
                    ok: response.ok,
                    status: response.status,
                    data: responseData,
                });

                if (!response.ok) {
                    console.error("Erro na resposta tarefa:", responseData);
                    throw new Error(responseData.message || "Erro ao atualizar tarefa");
                }
            } else {
                console.warn("Tipo de evento não reconhecido ou sem ID:", { type, taskId: task?.id, subtaskId: subtask?.id });
                info.revert();
                return;
            }

            console.log("✅ Atualização bem-sucedida no backend");

            // Não precisamos atualizar o estado porque o FullCalendar já gerencia
            // a posição do evento visualmente. Manter o estado como está evita
            // conflitos de renderização que fazem o evento desaparecer.
            
            console.log("=== DRAG AND DROP CONCLUÍDO COM SUCESSO ===");
        } catch (error) {
            console.error("❌ Erro ao atualizar data:", error);
            info.revert();
            alert(`Erro ao atualizar a data da tarefa: ${error.message}`);
        }
    }

    function handleEventResize(info) {
        const { event } = info;
        setEvents((prev) =>
            prev.map((e) =>
                e.id === event.id ? { ...e, start: event.start, end: event.end || undefined } : e
            )
        );
    }

    function handleSelect(selection) {
        const newEvt = {
            id: crypto.randomUUID(),
            title: "Novo evento",
            start: selection.start,
            end: selection.end || undefined,
            allDay: selection.allDay,
            extendedProps: { type: "temp" },
        };
        setEvents((prev) => [...prev, newEvt]);
    }

    return (
        <div style={{ padding: 16 }}>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                locale={ptBr}
                height="auto"
                weekends
                events={events}
                editable
                selectable
                selectMirror
                dayMaxEventRows={3}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                select={handleSelect}
                eventClick={(info) => {
                    const { task, subtask } = info.event.extendedProps || {};
                    onTaskClicked?.(subtask ? { ...task, _clickedSubtask: subtask } : task);
                }}
            />
        </div>
    );
};

export default Agenda;
