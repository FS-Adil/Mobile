import { createContext, useState, useId } from "react";

import { loging, logoutg } from "../services/new_api";

export const UserContext = createContext()

export function UserProvider ({ children }) {

    const [user, setUser] = useState(null)

    async function login (userName, password) {

        try {

            const response = await loging(userName, password);
            setUser(response)

        } catch (error) {
            throw Error(error.message)
        }
        
    }

    async function register (userName, password) {

        try {
            


        } catch (error) {
            console.log(error.message)
        }
    }

    async function logout () {
        logoutg();
        setUser(null)
    }

    return (

        <UserContext.Provider value={{user, login, register, logout}}>
            {children}
        </UserContext.Provider>

    )

}