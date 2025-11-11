import { useEffect, useMemo, useRef, useState } from "react";

// Durações padrão (segundos)
const DEFAULT_DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};

const pad = (n) => n.toString().padStart(2, "0");
const formatTime = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

function useInterval(cb, delay) {
    const savedRef = useRef(cb);
    useEffect(() => {
        savedRef.current = cb;
    }, [cb]);
    useEffect(() => {
        if (delay === null) return;
        const id = setInterval(() => savedRef.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}

function useLocalStorage(key, initial) {
    const [state, setState] = useState(() => {
        try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
            return raw ? JSON.parse(raw) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {}
    }, [key, state]);
    return [state, setState];
}

// Beep simples
function useBeep() {
    const beep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch {
            // Fallback silencioso se não conseguir tocar
            console.log("Audio não disponível");
        }
    };
    return beep;
}

export default function Pomodoro() {
    // Configurações principais
    const [durations, setDurations] = useLocalStorage("pomodoro:durations", DEFAULT_DURATIONS);

    // Estados temporários para os inputs
    const [tempInputs, setTempInputs] = useState({
        focus: Math.round(DEFAULT_DURATIONS.focus / 60).toString(),
        short: Math.round(DEFAULT_DURATIONS.short / 60).toString(),
        long: Math.round(DEFAULT_DURATIONS.long / 60).toString(),
    });

    // Atualiza os inputs quando as durações mudam
    useEffect(() => {
        setTempInputs({
            focus: Math.round(durations.focus / 60).toString(),
            short: Math.round(durations.short / 60).toString(),
            long: Math.round(durations.long / 60).toString(),
        });
    }, [durations]);

    // Estado do timer
    const [mode, setMode] = useState("focus");
    const [secondsLeft, setSecondsLeft] = useState(durations[mode]);
    const [running, setRunning] = useState(true); // Inicia automaticamente
    const [pomodorosDone, setPomodorosDone] = useState(0);
    const [focusStreak, setFocusStreak] = useState(0);

    const beep = useBeep();

    // Ajusta secondsLeft se a duração do modo mudar
    useEffect(() => {
        setSecondsLeft((prev) => (prev > durations[mode] ? durations[mode] : prev));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [durations, mode]);

    useInterval(
        () => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    onFinish();
                    return 0;
                }
                return s - 1;
            });
        },
        running ? 1000 : null
    );

    // Notificações
    useEffect(() => {
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    const percent = useMemo(() => {
        const total = durations[mode] || 1;
        return 100 - (secondsLeft / total) * 100;
    }, [secondsLeft, durations, mode]);

    // Notificação simples
    function notify(title) {
        try {
            if (document.hidden && Notification.permission === "granted") {
                new Notification(title);
            }
        } catch {}
    }

    function onFinish() {
        setRunning(false);
        beep();
        if (mode === "focus") {
            setPomodorosDone((n) => n + 1);
            setFocusStreak((s) => s + 1);
            const nextMode = (focusStreak + 1) % 4 === 0 ? "long" : "short";
            switchMode(nextMode, true); // Auto-start a próxima sessão
            notify("Pomodoro finalizado!");
        } else {
            setFocusStreak((s) => (mode === "long" ? 0 : s));
            switchMode("focus", true); // Auto-start o próximo foco
            notify("Pausa finalizada!");
        }
    }

    function switchMode(next, autoStart = false) {
        setMode(next);
        setSecondsLeft(durations[next]);
        setRunning(autoStart); // Inicia automaticamente se especificado
    }

    function toggle() {
        setRunning((r) => !r);
    }
    function reset() {
        setSecondsLeft(durations[mode]);
        setRunning(false);
    }
    function skip() {
        setSecondsLeft(0);
    }

    const ModeButton = ({ m, label }) => (
        <button
            onClick={() => switchMode(m)}
            className={`px-3 py-1 rounded-full text-sm transition border ${
                mode === m
                    ? "bg-white text-black border-white"
                    : "border-white/20 hover:bg-white/10"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen text-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <header className="flex items-center justify-between gap-3 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pomodoro</h1>
                    <div className="flex items-center gap-2">
                        <ModeButton m="focus" label="Foco" />
                        <ModeButton m="short" label="Pausa Curta" />
                        <ModeButton m="long" label="Pausa Longa" />
                    </div>
                </header>

                {/* Timer + Lateral */}
                <div className="grid md:grid-cols-[1fr_320px] gap-6">
                    {/* Timer Card */}
                    <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-xl">
                        <div className="flex flex-col items-center">
                            <div className="relative w-64 h-64 mb-6 select-none">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(rgb(255 255 255 / 0.9) ${percent}%, rgb(255 255 255 / 0.08) ${percent}%)`,
                                    }}
                                />
                                <div className="absolute inset-2 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center">
                                    <span className="tabular-nums text-6xl font-medium tracking-tight">
                                        {formatTime(secondsLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* Controles */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggle}
                                    className="px-5 py-2 rounded-xl bg-white text-black font-medium hover:opacity-90 active:opacity-80 transition"
                                >
                                    {running ? "Pausar" : "Iniciar"}
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
                                >
                                    Resetar
                                </button>
                                <button
                                    onClick={skip}
                                    className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
                                >
                                    Pular
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Configurações */}
                    <aside className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">Configurações</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/70">Foco (min)</label>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Mínimo 1 minuto"
                                    className="mt-1 w-full bg-transparent border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={tempInputs.focus}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || !isNaN(Number(value))) {
                                            setTempInputs((prev) => ({
                                                ...prev,
                                                focus: value,
                                            }));
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || Number(value) < 1) {
                                            alert("O tempo de foco deve ser pelo menos 1 minuto");
                                            setTempInputs((prev) => ({
                                                ...prev,
                                                focus: "1",
                                            }));
                                            setDurations((d) => ({
                                                ...d,
                                                focus: 1 * 60,
                                            }));
                                        } else {
                                            setDurations((d) => ({
                                                ...d,
                                                focus: Number(value) * 60,
                                            }));
                                        }
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-white/70">
                                        Pausa Curta (min)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Mínimo 1 minuto"
                                        className="mt-1 w-full bg-transparent border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={tempInputs.short}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || !isNaN(Number(value))) {
                                                setTempInputs((prev) => ({
                                                    ...prev,
                                                    short: value,
                                                }));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || Number(value) < 1) {
                                                alert(
                                                    "O tempo da pausa curta deve ser pelo menos 1 minuto"
                                                );
                                                setTempInputs((prev) => ({
                                                    ...prev,
                                                    short: "1",
                                                }));
                                                setDurations((d) => ({
                                                    ...d,
                                                    short: 1 * 60,
                                                }));
                                            } else {
                                                setDurations((d) => ({
                                                    ...d,
                                                    short: Number(value) * 60,
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/70">
                                        Pausa Longa (min)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Mínimo 1 minuto"
                                        className="mt-1 w-full bg-transparent border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={tempInputs.long}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || !isNaN(Number(value))) {
                                                setTempInputs((prev) => ({
                                                    ...prev,
                                                    long: value,
                                                }));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || Number(value) < 1) {
                                                alert(
                                                    "O tempo da pausa longa deve ser pelo menos 1 minuto"
                                                );
                                                setTempInputs((prev) => ({
                                                    ...prev,
                                                    long: "1",
                                                }));
                                                setDurations((d) => ({
                                                    ...d,
                                                    long: 1 * 60,
                                                }));
                                            } else {
                                                setDurations((d) => ({
                                                    ...d,
                                                    long: Number(value) * 60,
                                                }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            {/* Status */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/70">Modo atual</span>
                                <span className="font-medium">
                                    {mode === "focus"
                                        ? "Foco"
                                        : mode === "short"
                                        ? "Pausa Curta"
                                        : "Pausa Longa"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/70">Pomodoros concluídos</span>
                                <span className="font-medium">{pomodorosDone}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/70">Streak de foco</span>
                                <span className="font-medium">{focusStreak % 4} / 4</span>
                            </div>

                            <button
                                onClick={() => {
                                    setPomodorosDone(0);
                                    setFocusStreak(0);
                                }}
                                className="mt-3 w-full border border-white/20 rounded-xl px-4 py-2 text-sm hover:bg-white/10"
                            >
                                Zerar contadores
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
