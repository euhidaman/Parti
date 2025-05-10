import React, { createContext, useState, useContext, useEffect } from 'react';

// Predefined user accounts (in a real app, these would be in a database)
const predefinedUsers = [
    { id: 1, username: 'prof', password: 'pass', role: 'professor' },
    { id: 2, username: 'stu1', password: 'pass1', role: 'student' },
    { id: 3, username: 'stu2', password: 'pass2', role: 'student' },
    { id: 4, username: 'stu3', password: 'pass3', role: 'student' }
];

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage on initial load
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (username, password) => {
        const user = predefinedUsers.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            // Remove password from the stored user object for security
            const { password, ...secureUser } = user;
            setCurrentUser(secureUser);
            localStorage.setItem('currentUser', JSON.stringify(secureUser));
            return true;
        }
        return false;
    };

    // Logout function
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    // Check if user is authenticated
    const isAuthenticated = () => !!currentUser;

    // Check if user has a specific role
    const hasRole = (role) => currentUser?.role === role;

    const value = {
        currentUser,
        login,
        logout,
        isAuthenticated,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;