import React, { useProfessions } from "../../hooks/useProfession";
import PropTypes from "prop-types";
const Profession = ({ id }) => {
    console.log(id);
    const { getProfession, isLoading } = useProfessions();
    const prof = getProfession(id);
    console.log(prof.name);
    if (!isLoading) {
        return <p>{prof.name}</p>;
    } else return "Loading...";
};
Profession.propTypes = {
    id: PropTypes.string
};
export default Profession;
