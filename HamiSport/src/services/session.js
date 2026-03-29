// Usamos window para que el handler sobreviva
// recargas de módulo por Vite HMR

export const registerSessionExpiredHandler = (fn) => {
  window.__hamiSessionExpiredHandler = fn
}

export const triggerSessionExpired = () => {
  // Guardar flag en sessionStorage para que Login.jsx lo lea
  // incluso después del redirect
  sessionStorage.setItem('hamisport_session_expired', 'true')
  if (window.__hamiSessionExpiredHandler) {
    window.__hamiSessionExpiredHandler()
  }
}