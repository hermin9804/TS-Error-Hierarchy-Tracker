function transformDataForD3(methodDependencyList, throwAbleErrorList) {
  function createNode(name, errors, dependencies) {
    const errorMessages = errors; // Keep the original error messages
    const nodeName = `${name}`;
    const children = dependencies.map((dep) => createNodeForMethod(dep));

    return {
      name: nodeName,
      children: children.length > 0 ? children : null,
      description: errorMessages,
    };
  }

  function createNodeForMethod(method) {
    const dependencies = methodDependencyList[method] || [];
    const errors = throwAbleErrorList[method] || [];
    return createNode(method, errors, dependencies);
  }

  // Find all methods that are dependencies of others
  const allDependencies = new Set();
  Object.values(methodDependencyList).forEach((depsArray) => {
    depsArray.forEach((dep) => allDependencies.add(dep));
  });

  // Root nodes are those not found in the set of all dependencies
  const rootNodes = Object.keys(methodDependencyList)
    .filter((method) => !allDependencies.has(method))
    .map((method) => createNodeForMethod(method));

  return rootNodes;
}

export default transformDataForD3;
