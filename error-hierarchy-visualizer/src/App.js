import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import TreePage from "./TreePage";
import methodDependencyGraph from "./graph-data/methodDependencyGraph.json";
import methodThrowableErrorMap from "./graph-data/methodThrowableErrorMap.json";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/tree/:treeId"
          element={
            <TreePage
              methodDependencyGraph={methodDependencyGraph}
              methodThrowableErrorMap={methodThrowableErrorMap}
            />
          }
        />
        <Route
          path="/"
          element={
            <HomePage
              methodDependencyGraph={methodDependencyGraph}
              methodThrowableErrorMap={methodThrowableErrorMap}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
