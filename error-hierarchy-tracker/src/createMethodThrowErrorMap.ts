import ts from "typescript";
import { StringArrayMap } from "../types/stringArrayMap";

export function createMethodThrowErrorMap(
  sourceFile: ts.SourceFile
): StringArrayMap {
  const errorMap: StringArrayMap = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          const fullMethodName = `${className}.${methodName}`;
          errorMap[fullMethodName] = [];

          findThrowStatements(member, (errorMessage) => {
            // Assuming errorMessage is cleaned in findThrowStatements
            errorMap[fullMethodName].push(errorMessage);
          });
        }
      });
    }
  });

  return errorMap;
}

function findThrowStatements(
  node: ts.Node,
  callback: (errorMessage: string) => void
) {
  if (ts.isThrowStatement(node) && node.expression) {
    const errorMessage = node.expression.getText();
    callback(errorMessage);
  }
  ts.forEachChild(node, (childNode) =>
    findThrowStatements(childNode, callback)
  );
}
