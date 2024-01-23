import * as ts from "typescript";

export function createDependencyGraph(sourceFile: ts.SourceFile) {
  const graph: { [className: string]: { [methodName: string]: any[] } } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();
      graph[className] = {};

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          graph[className][methodName] = [];

          findServiceMethodCalls(
            member,
            (serviceClassName, serviceMethodName) => {
              graph[className][methodName].push({
                service: serviceClassName,
                method: serviceMethodName,
              });
            }
          );
        }
      });
    }
  });

  return graph;
}

function findServiceMethodCalls(
  node: ts.Node,
  callback: (serviceClassName: string, serviceMethodName: string) => void
) {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression)
  ) {
    const serviceClassName = node.expression.expression.getText();
    const serviceMethodName = node.expression.name.getText();
    callback(serviceClassName, serviceMethodName);
  }
  ts.forEachChild(node, (childNode) =>
    findServiceMethodCalls(childNode, callback)
  );
}

// const targetFiles = findFilesInDir("./src", /\.controller\.ts$|\.service\.ts$/);

// let globalDependencyGraph = {};

// for (const file of targetFiles) {
//   const sourceCode = ts.sys.readFile(file) || "";
//   const sourceFile = ts.createSourceFile(
//     file,
//     sourceCode,
//     ts.ScriptTarget.Latest,
//     true
//   );

//   const dependencyGraph = createDependencyGraph(sourceFile);
//   globalDependencyGraph = { ...globalDependencyGraph, ...dependencyGraph };
// }

// console.log(JSON.stringify(globalDependencyGraph, null, 2));
