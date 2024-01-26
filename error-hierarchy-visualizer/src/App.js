import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TreePage from "./TreePage";
import methodDependencyList from "./graph-data/methodDependencyList.json";
import throwAbleErrorList from "./graph-data/throwAbleErrorList.json";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/tree/:treeId"
          element={
            <TreePage
              methodDependencyList={methodDependencyList}
              throwAbleErrorList={throwAbleErrorList}
            />
          }
        />
        <Route
          path="/"
          element={
            <HomePage
              methodDependencyList={methodDependencyList}
              throwAbleErrorList={throwAbleErrorList}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
