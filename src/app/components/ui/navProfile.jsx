import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useHistory } from "react-router-dom";

const NavProfile = () => {
    const { location } = useHistory();
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen((prevState) => !prevState);
    };
    return (
        <div className="dropdown" onClick={toggleMenu}>
            <div className="btn dropdown-toggle d-flex align-items-center">
                <div className="me-2">{currentUser.name}</div>
                <img
                    src={currentUser.image}
                    alt="avatar"
                    className="img-responsive rounded-circle"
                    width="40"
                    height="40"
                />
            </div>
            <div className={"w-100 dropdown-menu" + (isOpen ? " show" : "")}>
                <Link
                    to={
                        location.pathname.includes("users")
                            ? `${currentUser._id}`
                            : `users/${currentUser._id}`
                    }
                    className="dropdown-item"
                >
                    Profile
                </Link>
                <Link to="/logout" className="dropdown-item">
                    Log Out
                </Link>
            </div>
        </div>
    );
};
export default NavProfile;
