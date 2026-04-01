export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function getStoredRole() {
  return localStorage.getItem("role");
}

export function getDefaultRouteForRole(role) {
  return role === "admin" ? "/admin" : role === "student" || role === "staff" ? "/user" : "/";
}
