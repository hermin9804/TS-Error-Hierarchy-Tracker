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

const getMaxTextLength = (data) => {
  let max = 0;
  const traverse = (node) => {
    if (node.name.length > max) {
      max = node.name.length;
    }
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  };
  traverse(data);
  return max;
};

const getMaxDescriptionArrayCount = (data) => {
  let max = 0;
  const traverse = (node) => {
    if (node.description && node.description.length > max) {
      max = node.description.length;
    }
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  };
  traverse(data);
  return max;
};

const ErrorHierarchyTree = ({ data }) => {
  const treeWrapperStyle = {
    width: "100%",
    height: "100vh",
  };
  const maxTextLength = getMaxTextLength(data);
  const maxDescriptionArrayCount = getMaxDescriptionArrayCount(data);
  const dynamicWidth = maxTextLength * 18 + 100;
  const dynamicHeight = maxDescriptionArrayCount * 18 + 100;
  const nodeSize = {
    x: dynamicWidth,
    y: dynamicHeight,
  };
  return (
    <div id="treeWrapper" style={treeWrapperStyle}>
      <Tree
        data={data}
        orientation="horizontal"
        translate={{ x: 300, y: 300 }}
        nodeSize={nodeSize}
        separation={{ siblings: 1, nonSiblings: 1 }}
        renderCustomNodeElement={renderCustomNodeElement}
      />
    </div>
  );
};

export default ErrorHierarchyTree;
