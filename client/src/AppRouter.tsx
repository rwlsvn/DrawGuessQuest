import React from 'react';
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import { v4 as uuidv4, validate as isUUID } from "uuid";
import GamePage from "./pages/GamePage/GamePage";


const AppRouter = () => {
    const location  = useLocation();

    const isCorrectPath = (id: string) : boolean => {
        const cleanPathname = id.startsWith('/') ? id.substring(1) : id;
        return isUUID(cleanPathname);
    }

    return (
        <Routes>
            <Route path={':id'} element={
                isCorrectPath(location.pathname)
                    ? <GamePage/>
                    : <Navigate to={uuidv4()} />
            } />
            <Route path="*" element={<Navigate to={uuidv4()} />} />
        </Routes>
    );
};

export default AppRouter;