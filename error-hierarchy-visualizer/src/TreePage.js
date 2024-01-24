import React from "react";
import { useParams } from "react-router-dom";
import ErrorHierarchyTree from "./ErrorHierarchyTree";
import transformDataForD3 from "./transformDataForD3";
import { methodDependencyList, throwAbleErrorList } from "./App";

const TreePage = () => {
  const { treeId } = useParams();
  const d3Data = transformDataForD3(methodDependencyList, throwAbleErrorList);

  const treeData = d3Data.find((data) => data.name === treeId);

  return (
    <div>
      <h1> Error Hierarchy Tree - {treeId}</h1>
      {treeData && <ErrorHierarchyTree data={treeData} />}
    </div>
  );
};

export default TreePage;
