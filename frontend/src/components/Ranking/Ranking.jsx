import React, { useEffect, useState } from "react";

const Ranking = () => {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = () => {
        setLoading(true);
        fetch("http://localhost:8800/ranking")
            .then((response) => response.json())
            .then((data) => {
                setRanking(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao buscar ranking:", error);
                setLoading(false);
            });
    };

    const getMedalIcon = (position) => {
        switch (position) {
            case 1:
                return "🥇";
            case 2:
                return "🥈";
            case 3:
                return "🥉";
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando ranking...</p>
            </div>
        );
    }

    if (ranking.length === 0) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400 text-lg">Nenhum usuário encontrado no ranking.</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                Ranking de Usuários
            </h1>
            
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-200 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Posição
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nome
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Pontuação
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {ranking.map((usuario, index) => {
                                    const position = index + 1;
                                    const medal = getMedalIcon(position);
                                    return (
                                        <tr
                                            key={usuario.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                position <= 3
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {medal && (
                                                        <span className="text-2xl mr-2">{medal}</span>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {position}º
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {usuario.nome}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {usuario.pontuacao} pontos
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;

