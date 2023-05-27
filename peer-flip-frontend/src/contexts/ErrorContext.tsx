import React from "react";

export const ErrorContext = React.createContext({
    errorMessage: '',
    setErrorMessage: (message: string) => { },
});