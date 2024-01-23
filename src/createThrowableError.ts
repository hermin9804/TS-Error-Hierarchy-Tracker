import * as ts from "typescript";

// const fileName = "./src/app.service.ts";
// const sourceCode = ts.sys.readFile(fileName) || "";
// const sourceFile = ts.createSourceFile(
//   fileName,
//   sourceCode,
//   ts.ScriptTarget.Latest,
//   true
// );

export function findMethodErrors(sourceFile: ts.SourceFile) {
  const errors: { [methodName: string]: string[] } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name?.getText() === "AppService") {
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          errors[methodName] = [];

          findThrowStatements(member, (errorMessage) => {
            errors[methodName].push(errorMessage);
          });
        }
      });
    }
  });

  return errors;
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

// const methodErrors = findMethodErrors(sourceFile);
// console.log(JSON.stringify(methodErrors, null, 2));
