import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";
import { CustomizacaoCalendarioComponent } from "./components/customizacao";

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
            const event = {
                id: `task-${t.id}`,
                title: t.title,
                start: date,
                allDay: true,
                extendedProps: { type: "task", task: t },
            };
            out.push(event);
        }
        if (Array.isArray(t.subtasks)) {
            for (const s of t.subtasks) {
                const subDate = toDateOnlyISO(s.due_date);
                if (!subDate) {
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
            }
        }
    }
    return out;
}

const Agenda = ({ onTaskClicked, reloadPage }) => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [customizacao, setCustomizacao] = useState({
        eventBackgroundColor: "#3b82f6",
        eventBorderColor: "#3b82f6",
        eventTextColor: "#ffffff",
        eventBorderRadius: 3,
        calendarBackgroundColor: "#f0f0f0",
        headerBackgroundColor: "#f9fafb",
        dayCellBackgroundColor: "#ffffff",
        todayBackgroundColor: "#fef3c7",
    });
    const calendarRef = useRef(null);

    const getMonthName = (date) => {
        const months = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ];
        return months[date.getMonth()];
    };

    useEffect(() => {
        fetch("http://localhost:8800/tarefas")
            .then((r) => r.json())
            .then((data) => {
                const events = buildEventsFromTasks(Array.isArray(data) ? data : []);
                setEvents(events);
            })
            .catch((error) => {
                setEvents([]);
            });
    }, [reloadPage]);

    useEffect(() => {
        const saved = localStorage.getItem("calendario-customizacao");
        if (saved) {
            setCustomizacao(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const allEvents = calendarApi.getEvents();

            allEvents.forEach((event) => {
                const el = event.el;
                if (el) {
                    el.style.backgroundColor = customizacao.eventBackgroundColor;
                    el.style.borderColor = customizacao.eventBorderColor;
                    el.style.color = customizacao.eventTextColor;
                    el.style.borderRadius = `${customizacao.eventBorderRadius}px`;
                    el.style.borderWidth = "1px";
                    el.style.borderStyle = "solid";

                    const titleEl = el.querySelector(".fc-event-title");
                    const timeEl = el.querySelector(".fc-event-time");
                    if (titleEl) titleEl.style.color = customizacao.eventTextColor;
                    if (timeEl) timeEl.style.color = customizacao.eventTextColor;
                }
            });
        }
    }, [
        customizacao.eventBackgroundColor,
        customizacao.eventBorderColor,
        customizacao.eventTextColor,
        customizacao.eventBorderRadius,
    ]);

    async function handleEventDrop(info) {
        const { event } = info;
        const { type, task, subtask } = event.extendedProps || {};
        const newDate = event.start ? toDateOnlyISO(event.start) : null;

        if (!newDate) {
            info.revert();
            return;
        }

        try {
            let response;

            if (type === "subtask" && subtask?.id) {
                // Atualizar subtarefa
                response = await fetch(`http://localhost:8800/subtarefas/${subtask.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ due_date: newDate }),
                });

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({ message: "Erro desconhecido" }));
                    throw new Error(errorData.message || "Erro ao atualizar subtarefa");
                }
            } else if (type === "task" && task?.id) {
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
                }

                response = await fetch(`http://localhost:8800/tarefas/${task.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(responseData.message || "Erro ao atualizar tarefa");
                }
            } else {
                info.revert();
                return;
            }
        } catch (error) {
            info.revert();
            alert(`Erro ao atualizar a data da tarefa: ${error.message}`);
        }

        // Atualizar eventos locais
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

    function handleDatesSet(arg) {
        setCurrentDate(arg.start);
    }

    function handleEventDidMount(info) {
        const el = info.el;
        el.style.backgroundColor = customizacao.eventBackgroundColor;
        el.style.borderColor = customizacao.eventBorderColor;
        el.style.color = customizacao.eventTextColor;
        el.style.borderRadius = `${customizacao.eventBorderRadius}px`;
        el.style.borderWidth = "1px";
        el.style.borderStyle = "solid";

        const titleEl = el.querySelector(".fc-event-title");
        const timeEl = el.querySelector(".fc-event-time");
        if (titleEl) titleEl.style.color = customizacao.eventTextColor;
        if (timeEl) timeEl.style.color = customizacao.eventTextColor;
    }

    function handleDayCellDidMount(info) {
        const el = info.el;
        const isToday = info.date.toDateString() === new Date().toDateString();

        if (isToday) {
            el.style.setProperty(
                "background-color",
                customizacao.todayBackgroundColor,
                "important"
            );
        } else {
            el.style.setProperty(
                "background-color",
                customizacao.dayCellBackgroundColor,
                "important"
            );
        }
    }

    useEffect(() => {
        if (calendarRef.current) {
            requestAnimationFrame(() => {
                const allDayCells = document.querySelectorAll(".fc-daygrid-day");
                allDayCells.forEach((el) => {
                    const isToday = el.classList.contains("fc-day-today");
                    if (isToday) {
                        el.style.setProperty(
                            "background-color",
                            customizacao.todayBackgroundColor,
                            "important"
                        );
                    } else {
                        el.style.setProperty(
                            "background-color",
                            customizacao.dayCellBackgroundColor,
                            "important"
                        );
                    }
                });

                const backgroundElements = document.querySelectorAll(
                    ".fc-view-harness, .fc-scrollgrid, .fc-daygrid-body, .fc-timeGrid-body, .fc-scroller"
                );
                backgroundElements.forEach((el) => {
                    el.style.setProperty(
                        "background-color",
                        customizacao.dayCellBackgroundColor,
                        "important"
                    );
                });
            });
        }
    }, [customizacao.dayCellBackgroundColor, customizacao.todayBackgroundColor]);

    return (
        <div style={{ padding: 14, position: "relative" }}>
            <CustomizacaoCalendarioComponent onConfigChange={setCustomizacao} />

            <div className="text-2xl text-gray-700 dark:text-gray-300 font-bold text-center mb-4">
                {getMonthName(currentDate)}
            </div>

            <style>
                {`
                    .fc-view-harness,
                    .fc-scrollgrid,
                    .fc-daygrid-body,
                    .fc-timeGrid-body,
                    .fc-scroller {
                        background-color: ${customizacao.dayCellBackgroundColor} !important;
                    }
                    .fc-header-toolbar {
                        background-color: transparent !important;
                    }
                    .fc-col-header-cell {
                        background-color: ${customizacao.headerBackgroundColor} !important;
                    }
                    .fc-daygrid-day {
                        background-color: ${customizacao.dayCellBackgroundColor} !important;
                    }
                    .fc-day-today {
                        background-color: ${customizacao.todayBackgroundColor} !important;
                    }
                    .fc-event {
                        background-color: ${customizacao.eventBackgroundColor} !important;
                        border-color: ${customizacao.eventBorderColor} !important;
                        color: ${customizacao.eventTextColor} !important;
                        border-radius: ${customizacao.eventBorderRadius}px !important;
                        border-width: 1px !important;
                        border-style: solid !important;
                    }
                    .fc-event .fc-event-title {
                        color: ${customizacao.eventTextColor} !important;
                    }
                    .fc-event .fc-event-time {
                        color: ${customizacao.eventTextColor} !important;
                    }
                    .fc-daygrid-event {
                        background-color: ${customizacao.eventBackgroundColor} !important;
                        border-color: ${customizacao.eventBorderColor} !important;
                        color: ${customizacao.eventTextColor} !important;
                        border-radius: ${customizacao.eventBorderRadius}px !important;
                    }
                    .fc-timegrid-event {
                        background-color: ${customizacao.eventBackgroundColor} !important;
                        border-color: ${customizacao.eventBorderColor} !important;
                        color: ${customizacao.eventTextColor} !important;
                        border-radius: ${customizacao.eventBorderRadius}px !important;
                    }
                `}
            </style>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listDay",
                }}
                i
                views={{
                    dayGridWeek: {
                        type: "dayGrid",
                        duration: { weeks: 1 },
                    },
                    listDay: {
                        type: "list",
                        duration: { days: 1 },
                    },
                }}
                locale={ptBr}
                height="auto"
                weekends
                events={events}
                editable
                selectable
                selectMirror
                dayMaxEventRows={3}
                datesSet={handleDatesSet}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                select={handleSelect}
                eventClick={(info) => {
                    const { task, subtask } = info.event.extendedProps || {};
                    onTaskClicked?.(subtask ? { ...task, _clickedSubtask: subtask } : task);
                }}
                eventDidMount={handleEventDidMount}
                dayCellDidMount={handleDayCellDidMount}
            />
        </div>
    );
};

export default Agenda;
