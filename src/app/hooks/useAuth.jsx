import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import propTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import userServices from "../services/user.service";
import localStorageService from "../services/localStorage.service";

export const httpAuth = axios.create({
    baseURL: "https://identitytoolkit.googleapis.com/v1/",
    params: {
        key: process.env.REACT_APP_FIREBASE_KEY
    }
});
const AuthContext = React.createContext();
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const history = useHistory();
    const [currentUser, setUser] = useState();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        if (error !== null) {
            toast.error(error);
            setError(null);
        }
    }, [error]);

    async function getUserData() {
        try {
            const { content } = await userServices.getCurrentUser();
            setUser(content);
        } catch (error) {
            errorsCatcher(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (localStorageService.getAccessToken()) {
            getUserData();
        } else {
            setLoading(false);
        }
    }, []);

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function logOut() {
        localStorageService.removeAuthData();
        setUser(null);
        history.push("/");
    }

    async function signUp({ email, password, ...rest }) {
        // const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.REACT_APP_FIREBASE_KEY}`;
        try {
            const { data } = await httpAuth.post(`accounts:signUp`, {
                email,
                password,
                returnSecureToken: true
            });
            localStorageService.setTokens(data);
            await createUser({
                _id: data.localId,
                email,
                rate: randomInt(1, 5),
                completedMeetings: randomInt(0, 200),
                image: `https://avatars.dicebear.com/api/avataaars/${(
                    Math.random() + 1
                )
                    .toString(36)
                    .substring(7)}.svg`,
                ...rest
            });
        } catch (error) {
            errorsCatcher(error);
            const { code, message } = error.response.data.error;
            if (code === 400) {
                if (message === "EMAIL_EXISTS") {
                    const errorObject = {
                        email: "Пользователь с таким email существует"
                    };
                    throw errorObject;
                }
            }
        }
    }

    async function signIn({ email, password }) {
        // const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_FIREBASE_KEY}`;
        try {
            const { data } = await httpAuth.post(
                `accounts:signInWithPassword`,
                { email, password, returnSecureToken: true }
            );
            localStorageService.setTokens(data);
            await getUserData();
        } catch (error) {
            errorsCatcher(error);
            const { code, message } = error.response.data.error;
            if (code === 400) {
                if (message === "INVALID_PASSWORD") {
                    const errorObject = {
                        password: "Введен неверный пароль"
                    };
                    throw errorObject;
                }
                if (message === "EMAIL_NOT_FOUND") {
                    const errorObject = {
                        email: "Email не зарегистрирован в системе"
                    };
                    throw errorObject;
                }
            }
        }
    }

    async function createUser(data) {
        try {
            const { content } = await userServices.create(data);
            setUser(content);
        } catch (error) {
            errorsCatcher(error);
        }
    }

    async function updateUser(data) {
        try {
            const { content } = await userServices.update(data);
            setUser(content);
            setLoading(false);
        } catch (error) {
            errorsCatcher(error);
        }
    }

    function errorsCatcher(error) {
        const { message } = error.response.data;
        setError(message);
    }

    return (
        <AuthContext.Provider
            value={{ signUp, signIn, currentUser, logOut, updateUser }}
        >
            {!isLoading ? children : "Loading..."}
        </AuthContext.Provider>
    );
};
AuthProvider.propTypes = {
    children: propTypes.oneOfType([
        propTypes.arrayOf(propTypes.node),
        propTypes.node
    ])
};
