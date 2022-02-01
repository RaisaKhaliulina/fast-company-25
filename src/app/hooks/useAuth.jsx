import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import userService from "../services/user.service";
import localStorageService, {
    setTokens
} from "../services/localStorage.service";
import { toast } from "react-toastify";

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
const AuthProvider = ({ children }) => {
    const history = useHistory();
    const [currentUser, setUser] = useState();
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        if (error !== null) {
            toast(error);
            setError(null);
        }
    }, [error]);
    async function getUserData() {
        try {
            const { content } = await userService.getCurrentUser();
            setUser(content);
        } catch (error) {
            errorCatcher(error);
        } finally {
            setLoading(false);
        }
    }
    function logOut() {
        localStorageService.removeAuthData();
        setUser(null);
        history.push("/");
    }
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    useEffect(() => {
        if (localStorageService.getAccessToken()) {
            getUserData();
        } else {
            setLoading(false);
        }
    }, []);
    async function signUp({ email, password, ...rest }) {
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
                complitedMitings: randomInt(0, 200),
                image: `https://avatar.dicebir.com/api/avataaars/${(
                    Math.random() + 1
                )
                    .toString(36)
                    .substring(7)}.svg`,
                ...rest
            });
        } catch (error) {
            errorCatcher(error);
            const { code, message } = error.response.data.error;
            if (code === 400) {
                if (message === "EMAIL_EXISTS") {
                    const errorObject = {
                        email: "Пользователь с таким Email уже существует"
                    };
                    throw errorObject;
                }
            }
        }
    }
    async function signIn({ email, password }) {
        try {
            const { data } = await httpAuth.post(
                `accounts:signUp`,
                { email, password, returnSecureToken: true }
            );
            localStorageService.setTokens(data);
            await getUserData();
        } catch (error) {
            errorCatcher(error);
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
            const { content } = await userService.create(data);
            setUser(content);
        } catch (error) {
            errorCatcher(error);
        }
    };
    async function updateUser(data) {
        try {
            const { content } = await userService.update(data);
            setUser(content);
            setLoading(false);
        } catch (error) {
            errorCatcher(error);
        }
    }
    function errorCatcher(error) {
        const { message } = error.response.data;
        setError(message);
    }
    async function logIn({ email, password }) {
        try {
            const { data } = await httpAuth.post(
                `accounts:signInWithPassword`,
                {
                    email,
                    password,
                    returnSecureToken: true
                }
            );
            setTokens(data);
            await getUserData();
        } catch (error) {
            errorCatcher(error);
            const { code, message } = error.response.data.error;
            console.log(code, message);
            if (code === 400) {
                switch (message) {
                    case "INVALID_PASSWORD":
                        throw new Error("Email или пароль введены некорректно");
                    default:
                        throw new Error(
                            "Слишком много попыток входа. Попробуйте позднее"
                        );
                }
            }
        }
    }
    return (
        <AuthContext.Provider
            value={{ logIn, signUp, currentUser, updateUser, signIn, logOut }}
        >
            {!isLoading ? children : "Loading..."}
        </AuthContext.Provider>
    );
};
export default AuthProvider;
AuthProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};
