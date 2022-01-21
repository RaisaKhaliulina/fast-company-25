import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import qualityService from "../services/quality.service";

const QualityContext = React.createContext();

export const useQuality = () => {
    return useContext(QualityContext);
};

export const QualityProvider = ({ children }) => {
    const [qualities, setQualities] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        if (error !== null) {
            toast(error);
            setError(null);
        }
    }, [error]);

    useEffect(() => {
        getQualitiesList();
    }, []);
    async function getQualitiesList() {
        try {
            const { content } = await qualityService.get();
            setQualities(content);
            setLoading(false);
        } catch (error) {
            errorsCatcher(error);
        }
    }
    function getQualitiesListFilter(items) {
        const arr = [];
        for (let i = 0; i < items.length; i++) {
            const res = qualities.filter((qual) => qual._id === items[i]);
            arr.push(...res);
        }
        return arr;
    }
    function errorsCatcher(error) {
        const { message } = error.response.data;
        setError(message);
        setLoading(false);
    }

    return (
        <QualityContext.Provider
            value={{ isLoading, qualities, getQualitiesListFilter }}
        >
            {children}
        </QualityContext.Provider>
    );
};
QualityProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};
