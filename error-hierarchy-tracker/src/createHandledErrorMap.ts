import ts from "typescript";
import { StringArrayMap } from "../types/stringArrayMap";
import { TrackerConfig } from "./tracker.config";

export function createHandledErrorMap(
  sourceFileList: ts.SourceFile[]
): StringArrayMap {
  return sourceFileList.filter(checkIfFileNameEndsWithSuffixList).reduce(
    (acc, sourceFile) => ({
      ...acc,
      ...createHandledErrorMapPerFile(sourceFile),
    }),
    {}
  );
}

function checkIfFileNameEndsWithSuffixList(sourceFile: ts.SourceFile): boolean {
  const rootClassTypeList = TrackerConfig.rootClassTypeList;
  const filename = sourceFile.fileName; // or any appropriate property that gives you the file name
  for (const type of rootClassTypeList) {
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
              if (decoratorName === TrackerConfig.errorHandlingDecoratorName) {
                const errorArgument = decorator.expression.arguments
                  .map((arg) => arg.getText())
                  .join(", ");
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
