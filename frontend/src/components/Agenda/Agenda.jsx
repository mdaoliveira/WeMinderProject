import React, { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";

const Agenda = ({ onTaskClicked, reloadPage }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8800/tarefas")
            .then((r) => r.json())
            .then((data) => setTasks(Array.isArray(data) ? data : []))
            .catch(() => setTasks([]));
    }, [reloadPage]);

    function toDateOnlyISO(value) {
        if (!value) return null;
        const d = new Date(value);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
    }

    const events = useMemo(() => {
        const evts = [];
        for (const t of tasks) {
            const taskDate = toDateOnlyISO(t.due_date);
            if (taskDate) {
                evts.push({
                    id: `task-${t.id}`,
                    title: t.title,
                    start: taskDate,
                    allDay: true,
                    extendedProps: {
                        type: "task",
                        task: t,
                    },
                });
            }
            if (Array.isArray(t.subtasks)) {
                for (const s of t.subtasks) {
                    const subDate = toDateOnlyISO(s.due_date);
                    if (!subDate) continue;
                    evts.push({
                        id: s.id ? `sub-${s.id}` : `sub-${t.id}-${s.title}`,
                        title: `${t.title} — ${s.title}`,
                        start: subDate,
                        allDay: true,
                        extendedProps: {
                            type: "subtask",
                            task: t,
                            subtask: s,
                        },
                    });
                }
            }
        }
        return evts;
    }, [tasks]);

    return (
        <div style={{ padding: 16 }}>
            <FullCalendar
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
                editable={false}
                selectable={false}
                eventClick={(info) => {
                    const { task, subtask } = info.event.extendedProps || {};
                    onTaskClicked?.(subtask ? { ...task, _clickedSubtask: subtask } : task);
                }}
            />
        </div>
    );
};

export default Agenda;
