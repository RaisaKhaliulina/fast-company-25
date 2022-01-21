import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Redirect, Route } from "react-router-dom";
import propTypes from "prop-types";

const ProtectedRoute = ({ component: Component, children, ...rest }) => {
    const { currentUser } = useAuth();
    return (
        <Route
            {...rest}
            render={(props) => {
                if (!currentUser) {
                    return (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    );
                }
                return Component ? <Component {...props} /> : children;
            }}
        />
    );
};

export default ProtectedRoute;

ProtectedRoute.propTypes = {
    location: propTypes.object,
    component: propTypes.func,
    children: propTypes.oneOfType([
        propTypes.arrayOf(propTypes.node),
        propTypes.node
    ])
};
