import React from "react";
import { Tree } from "react-d3-tree";

const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => {
  return (
    <g>
      <circle r={15} fill="#999" onClick={toggleNode} />
      <text fill="black" strokeWidth="1" x={20} y={20} textAnchor="start">
        {nodeDatum.name}
      </text>
      {nodeDatum.description &&
        nodeDatum.description.map((error, index) => (
          <text
            fill="black"
            strokeWidth="1"
            x={20}
            y={40 + index * 20}
            textAnchor="start"
          >
            {error}
          </text>
        ))}
    </g>
  );
};

const ErrorHierarchyTree = ({ data }) => {
  const treeWrapperStyle = {
    width: "100%",
    height: "100vh",
  };

  return (
    <div id="treeWrapper" style={treeWrapperStyle}>
      <Tree
        data={data}
        orientation="horizontal"
        translate={{ x: 300, y: 300 }}
        nodeSize={{ x: 300, y: 200 }}
        separation={{ siblings: 0.5, nonSiblings: 0.5 }}
        renderCustomNodeElement={renderCustomNodeElement}
      />
    </div>
  );
};

export default ErrorHierarchyTree;
