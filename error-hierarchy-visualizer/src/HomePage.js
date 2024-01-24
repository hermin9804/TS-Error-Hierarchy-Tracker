import React from "react";
import { Link } from "react-router-dom";
import transformDataForD3 from "./transformDataForD3";

const HomePage = ({ methodDependencyList, throwAbleErrorList }) => {
  const d3Data = transformDataForD3(methodDependencyList, throwAbleErrorList);

  return (
    <div>
      <h1>Select a Tree</h1>
      {d3Data.map((data, index) => (
        <div key={index}>
          <Link to={`/tree/${data.name}`}>{data.name}</Link>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
