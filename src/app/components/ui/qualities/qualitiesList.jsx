import React from "react";
import PropTypes from "prop-types";
import Quality from "./quality";
import { useQualities } from "../../../hooks/useQualities";
const QualitiesList = ({ qualities }) => {
    const { isLoading, getQualitiesListFilter } = useQualities();
    if (!isLoading) {
        return (
            <>
                {getQualitiesListFilter(qualities).map((qual) => (
                    <Quality key={qual._id} {...qual} />
                ))}
            </>
        );
    } else {
        return <>Loading...</>;
    }
};
QualitiesList.propTypes = {
    qualities: PropTypes.array
};

export default QualitiesList;
