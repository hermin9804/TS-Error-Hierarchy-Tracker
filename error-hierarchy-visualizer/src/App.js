import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TreePage from "./TreePage";
import methodDependencyGraph from "./graph-data/methodDependencyGraph.json";
import methodThrowErrorMap from "./graph-data/methodThrowErrorMap.json";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/tree/:treeId"
          element={
            <TreePage
              methodDependencyGraph={methodDependencyGraph}
              methodThrowErrorMap={methodThrowErrorMap}
            />
          }
        />
        <Route
          path="/"
          element={
            <HomePage
              methodDependencyGraph={methodDependencyGraph}
              methodThrowErrorMap={methodThrowErrorMap}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
