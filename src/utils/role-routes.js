export function getHomeRoute(role) {
  return role === "hospital" ? "/hospital" : "/consumer";
}
