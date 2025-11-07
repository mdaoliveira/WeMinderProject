import React, { useEffect, useState } from "react";
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
    const out = [];
    for (const t of tasks) {
        const date = toDateOnlyISO(t.due_date);
        if (date) {
            out.push({
                id: `task-${t.id}`,
                title: t.title,
                start: date,
                allDay: true,
                extendedProps: { type: "task", task: t },
            });
        }
        if (Array.isArray(t.subtasks)) {
            for (const s of t.subtasks) {
                const subDate = toDateOnlyISO(s.due_date);
                if (!subDate) continue;
                out.push({
                    id: s.id ? `sub-${s.id}` : `sub-${t.id}-${s.title}`,
                    title: `${t.title} — ${s.title}`,
                    start: subDate,
                    allDay: true,
                    extendedProps: { type: "subtask", task: t, subtask: s },
                });
            }
        }
    }
    return out;
}

const Agenda = ({ onTaskClicked, reloadPage }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8800/tarefas")
            .then((r) => r.json())
            .then((data) => setEvents(buildEventsFromTasks(Array.isArray(data) ? data : [])))
            .catch(() => setEvents([]));
    }, [reloadPage]);

    function handleEventDrop(info) {
        const { event } = info;
        setEvents((prev) =>
            prev.map((e) =>
                e.id === event.id
                    ? {
                          ...e,
                          start: event.start,
                          end: event.end || undefined,
                          allDay: event.allDay,
                      }
                    : e
            )
        );
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
