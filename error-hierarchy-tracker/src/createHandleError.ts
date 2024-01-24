import * as ts from "typescript";

const fileName = "./src/app.controller.ts";
const sourceCode = ts.sys.readFile(fileName) || "";
const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

export function findHandledErrors(sourceFile: ts.SourceFile) {
  const errors: { [methodName: string]: string[] } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isClassDeclaration(node) &&
      node.name?.getText() === "AppController"
    ) {
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          errors[methodName] = [];

          const decorators = ts.getDecorators(member);
          decorators?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const decoratorName = decorator.expression.expression.getText();
              if (decoratorName === "HandleError") {
                const errorArgument =
                  decorator.expression.arguments[0].getText();
                errors[methodName].push(errorArgument);
              }
            }
          });
        }
      });
    }
  });

  return errors;
}

// const methodHandledErrors = findHandledErrors(sourceFile);
// console.log(JSON.stringify(methodHandledErrors, null, 2));
