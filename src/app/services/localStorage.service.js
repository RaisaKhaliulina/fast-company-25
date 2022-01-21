const TOKEN_KEY = "jwt-token";
const REFRESH_KEY = "jwt-refresh-token";
const EXPIRES_KEY = "jwt-expire-date";
const USERID_KEY = "user-local-id";

export function setTokens({
    idToken,
    refreshToken,
    localId,
    expiresIn = 3600
}) {
    const expiresDate = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(USERID_KEY, localId);
    localStorage.setItem(TOKEN_KEY, idToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(EXPIRES_KEY, expiresDate);
}

function removeAuthData() {
    localStorage.removeItem(USERID_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_KEY);
}

function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

function getTokenExpiresDate() {
    return localStorage.getItem(EXPIRES_KEY);
}

function getUserById() {
    return localStorage.getItem(USERID_KEY);
}

const localStorageService = {
    setTokens,
    removeAuthData,
    getAccessToken,
    getRefreshToken,
    getTokenExpiresDate,
    getUserById
};

export default localStorageService;
