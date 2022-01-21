import axios from "axios";
import { toast } from "react-toastify";
import configFile from "../config";
import localStorageServices from "./localStorage.service";
import { httpAuth } from "../hooks/useAuth";
const http = axios.create({
    baseURL: configFile.apiEndPoint
});

axios.defaults.baseURL = configFile.apiEndPoint;
axios.interceptors.response.use(
    async function (config) {
        if (configFile.isFirebase) {
            const containSlash = /\/$/gi.test(config.url);
            config.url =
                (containSlash ? config.url.slice(0, -1) : config.url) + ".json";
            const expiresData = localStorageServices.getTokenExpiresDate();
            const refreshToken = localStorageServices.getRefreshToken();
            if (refreshToken && expiresData < Date.now()) {
                const { data } = await httpAuth.post("token", {
                    grant_type: "refresh_token",
                    refresh_token: refreshToken
                });
                localStorageServices.setTokens({
                    idToken: data.id_token,
                    refreshToken: data.refresh_token,
                    localId: data.user_id,
                    expiresIn: data.expires_in
                });
            }
            const accessToken = localStorageServices.getAccessToken();
            if (accessToken) {
                config.params = {
                    ...config.params,
                    auth: accessToken
                };
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// function transformData(data) {
//     return data ? Object.keys(data).map(key => ({
//         ...data[key]
//     })) : [];
// }

function transformData(data) {
    return data && !data._id
        ? Object.keys(data).map((key) => ({
              ...data[key]
          }))
        : data;
}

http.interceptors.response.use(
    (res) => {
        if (configFile.isFirebase) {
            res.data = { content: transformData(res.data) };
        }
        return res;
    },
    function (error) {
        const expectedErrors =
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500;
        if (!expectedErrors) {
            toast("unExpectedErrors");
            toast.error("Something was wrong. Try it letter");
        }
        return Promise.reject(error);
    }
);

const httpService = {
    get: http.get,
    put: http.put,
    post: http.post,
    delete: http.delete,
    patch: http.patch
};

export default httpService;
