import { useState, useEffect } from "react";
import professions from "../mockData/professions";
import users from "../mockData/users";
import qualities from "../mockData/qualities";
import httpService from "../services/http.service";

const useMockData = () => {
    const statusConsts = {
        idle: "Not started",
        pending: "In process",
        success: "Ready",
        error: "Error occured"
    };
    const [error, setError] = useState();
    const [count, setCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState(statusConsts.idle);
    const summaryCount = professions.length + users.length + qualities.length;
    const incrementCount = () => {
        setCount((prevState) => prevState + 1);
    };
    const updateProgress = () => {
        if (count !== 0 && statusConsts.idle) {
            setStatus(statusConsts.pending);
        }
        const newProgress = Math.floor((count / summaryCount) * 100);
        if (progress < newProgress) {
            setProgress(() => newProgress);
        }
        if (newProgress === 100) {
            setStatus(statusConsts.success);
        }
    };

    useEffect(() => {
        updateProgress();
    }, [count]);

    async function initialize() {
        try {
            for (const prof of professions) {
                await httpService.put("profession/" + prof._id, prof);
                incrementCount();
            }
            for (const user of users) {
                await httpService.put("user/" + user._id, user);
                incrementCount();
            }
            for (const quality of qualities) {
                await httpService.put("quality/" + quality._id, quality);
                incrementCount();
            }
        } catch (error) {
            setError(error);
            setStatus(statusConsts.error);
        }
    }

    return { error, initialize, progress, status };
};

export default useMockData;
