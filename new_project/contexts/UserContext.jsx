import { createContext, useState, useId } from "react";

export const UserContext = createContext()

export function UserProvider ({ children }) {

    const [user, setUser] = useState(null)

    async function login (email, password) {
        
    }

    async function register (email, password) {

        try {
            const id = useId();
            

        } catch (error) {
            console.log(error.message)
        }
    }

    async function logout (email, password) {
        
    }

    return (

        <UserContext.Provider value={{user, login, register, logout}}>
            {children}
        </UserContext.Provider>

    )

}