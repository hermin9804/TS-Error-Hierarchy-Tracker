import ts from "typescript";
import { StringArrayMap } from "../types/stringArrayMap";

export function createHandledErrorMap(
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
