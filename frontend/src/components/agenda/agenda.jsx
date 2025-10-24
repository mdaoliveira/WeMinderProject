import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBr from "@fullcalendar/core/locales/pt-br";
import { useState, useEffect } from "react";

const Agenda = ({ onTaskClicked, reloadPage }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8800/tarefas")
            .then((response) => response.json())
            .then((data) => {
                setEvents(data);
            });
    }, [reloadPage]);

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
                weekends={true}
                events={events}
                editable={false}
                selectable={false}
            />
        </div>
    );
};

export default Agenda;
