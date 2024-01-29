import ts from "typescript";
import { StringArrayMap } from "../types/stringArrayMap";
import { TrackerConfig } from "./tracker.config";

export function createHandledErrorMap(
  sourceFileList: ts.SourceFile[]
): StringArrayMap {
  let allErrorMap: StringArrayMap = {};
  for (const sourceFile of sourceFileList) {
    if (!checkIfFileNameEndsWithSuffixList(sourceFile.fileName)) {
      continue;
    }

    allErrorMap = {
      ...allErrorMap,
      ...createHandledErrorMapPerFile(sourceFile),
    };
  }
  return allErrorMap;
}

function checkIfFileNameEndsWithSuffixList(filename: string): boolean {
  const rootClassTypeLsit = TrackerConfig.rootClassTypeList;
  for (const type of rootClassTypeLsit) {
    if (filename.endsWith(`${type}.ts`)) {
      return true;
    }
  }
  return false;
}

function createHandledErrorMapPerFile(
  sourceFile: ts.SourceFile
): StringArrayMap {
  const errors: StringArrayMap = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          const fullMethodName = `${className}.${methodName}`;
          errors[fullMethodName] = [];

          const decorators = ts.getDecorators(member);
          decorators?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const decoratorName = decorator.expression.expression.getText();
              if (decoratorName === "HandleError") {
                const errorArgument =
                  decorator.expression.arguments[0].getText();
                // Clean the error argument if necessary
                errors[fullMethodName].push(errorArgument);
              }
            }
          });
        }
      });
    }
  });

  return errors;
}
