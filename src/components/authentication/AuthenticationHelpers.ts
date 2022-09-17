import * as protectedRoutes from "../../constants/routes";

const mainRoutes = Object.values(protectedRoutes).map((route) => route.split("/")[1]).filter(Boolean);
const routesSet = new Set(mainRoutes);

const validUsernameRegex = /^[0-9a-zA-Z_.-]+$/;
// Source for validEmailRegex: https://emailregex.com
const validEmailRegex = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function usernameIsValid(name: string) {
    return validUsernameRegex.test(name) && !routesSet.has(name);
}

export function emailIsValid(email: string) {
    return validEmailRegex.test(email.toLowerCase());
}
