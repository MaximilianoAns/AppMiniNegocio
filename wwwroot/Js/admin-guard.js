// ─────────────────────────────────────────────────────────────

//  Verifica que haya sesión activa con rol Admin antes de que
//  el resto del JS se ejecute. Si no, redirige a login.html.
// ─────────────────────────────────────────────────────────────

(function adminGuard() {

    //Hay token?
    const token = localStorage.getItem('token');

    if (!token) {
        redirigirLogin('sin-sesion');
        return;
    }

    //El token tiene estructura valida?
    const payload = parsearToken(token);

    if (!payload) {
        limpiarYRedirigir('token-invalido');
        return;
    }

    //El token expiro?
    const ahora = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < ahora) {
        limpiarYRedirigir('token-expirado');
        return;
    }

    // El usuario tiene rol Admin?
    const rol =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        payload['Role'] ||
        null;

    if (rol !== 'Admin') {
        // Usuario logueado pero sin permisos → lo mandamos a su perfil
        window.location.replace('../Html/perfil.html');
        return;
    }

    // ✅ Todo OK — el script continúa normalmente

})();



// Parsea el payload de un JWT. Si el formato es inválido, devuelve null.
function parsearToken(token) {
    try {
        const parte = token.split('.')[1];
        return JSON.parse(atob(parte));
    } catch {
        return null;
    }
}

// Limpia el token y redirige a login con un motivo específico
function limpiarYRedirigir(motivo) {
    localStorage.removeItem('token');
    redirigirLogin(motivo);
}

// Redirige a login.html guardando un motivo para mostrar un mensaje contextual
function redirigirLogin(motivo) {
    // Guardamos el motivo para mostrar un mensaje en el login si se quiere
    sessionStorage.setItem('guardRedirect', motivo);
    window.location.replace('../Html/login.html');
}
