import React from "react";

import useMockData from "../utils/mockData";

const Main = () => {
    const { initialized, progress, status, error } = useMockData();
    const handleClick = () => {
        initialized();
    };
    return (
        <div className="container mt-5">
            <h1> Main Page</h1>
            <h3>Инициализация данных</h3>
            <ul>
                <li>Status: {status} </li>
                <li>Progress: {progress} % </li>
                {error && <li>Error: {error}</li>}
            </ul>
            <span> </span>
            <button className="btn btn-primary" onClick={handleClick}>
                Инициализировать данные
            </button>
        </div>
    );
};

export default Main;
