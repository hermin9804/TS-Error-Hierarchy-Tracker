import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TreePage from "./TreePage";

export const methodDependencyList = {
  "AppController.snsLogin": ["AppService.snsLogin"],
  "AppService.snsLogin": ["SnsAuthService.validate"],
  "KakaoStrategy.validate": [],
  "NaverStrategy.validate": [],
  "SnsAuthService.validate": [
    "KakaoStrategy.validate",
    "NaverStrategy.validate",
  ],
  "UserController.getUser": ["UserService.findUser"],
  "UserService.findUser": ["UserRepository.findUser"],
  "UserController.patchUser": ["UserService.updateUser"],
  "UserService.updateUser": ["UserRepository.updateUser"],
};

export const throwAbleErrorList = {
  "AppController.snsLogin": [],
  "AppService.snsLogin": [],
  "KakaoStrategy.validate": [
    "new Error('KakaoStrategy Error!!')",
    "new Error('KakaoStrategy Error!!')",
  ],
  "NaverStrategy.validate": ["new Error('NaverStrategy Error!!')"],
  "SnsAuthService.validate": ["new Error('Not supported sns provider')"],
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tree/:treeId" element={<TreePage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
