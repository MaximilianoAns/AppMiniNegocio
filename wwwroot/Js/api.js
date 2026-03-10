function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
        // opcional: cortar si no hay sesión
        return Promise.reject("No hay sesión");
    }

    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: "Bearer " + token
        }
    });
}