import ts from "typescript";
import { StringArrayMap } from "../types/stringArrayMap";
import { TrackerConfig } from "./tracker.config";

export function createMethodDependencyGraph(
  sourceFileList: ts.SourceFile[]
): StringArrayMap {
  return sourceFileList.reduce(
    (acc, sourceFile) => ({
      ...acc,
      ...createMethodDependencyGraphPerFile(sourceFile),
    }),
    {}
  );
}

function createMethodDependencyGraphPerFile(
  sourceFile: ts.SourceFile
): StringArrayMap {
  const dependencyMap: StringArrayMap = {};

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isClassDeclaration(node) || !node.name) {
      return;
    }

    const className = node.name.getText();

    node.members.forEach((member) => {
      if (!ts.isMethodDeclaration(member) || !member.name) {
        return;
      }

      const methodName = member.name.getText();
      const fullMethodName = `${className}.${methodName}`;

      if (!dependencyMap[fullMethodName]) {
        dependencyMap[fullMethodName] = [];
      }

      findServiceMethodCalls(
        member,
        (dependencyClassName, dependencyMethodName) => {
          if (dependencyClassName === "this") {
            dependencyClassName = className;
          } else if (dependencyClassName.startsWith("this.")) {
            dependencyClassName = dependencyClassName.slice(5);
            dependencyClassName =
              dependencyClassName.charAt(0).toUpperCase() +
              dependencyClassName.slice(1);
          }

          const fullDependencyName = `${dependencyClassName}.${dependencyMethodName}`;

          if (!dependencyMap[fullMethodName].includes(fullDependencyName)) {
            dependencyMap[fullMethodName].push(fullDependencyName);
          }
        }
      );
    });
  });

  for (const [key, value] of Object.entries(dependencyMap)) {
    const filteredValue = value.filter((v) => hasClassSuffix(v));
    dependencyMap[key] = filteredValue;
  }
  return dependencyMap;
}

function hasClassSuffix(className: string): boolean {
  const suffixes = TrackerConfig.getCapitalizedTargetFileTypeList();
  const hasSuffix = suffixes.some((suffix) => className.includes(suffix));
  return hasSuffix;
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
