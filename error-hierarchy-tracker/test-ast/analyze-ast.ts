import * as ts from "typescript";

// 함수 호출을 찾는 함수입니다.
function findFunctionCalls(node: ts.Node, sourceFile: ts.SourceFile) {
  ts.forEachChild(node, (childNode) => {
    if (ts.isCallExpression(childNode)) {
      const expression = childNode.expression;
      console.log("Function call:", expression.getText(sourceFile));
    }
    findFunctionCalls(childNode, sourceFile);
  });
}

// AST 생성
const fileName = "./src/ast-test/example.ts";
const sourceCode = ts.sys.readFile(fileName) || "";
const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

console.log("AST:", sourceFile);

// 'main' 함수 내의 함수 호출 찾기
const mainFunction = sourceFile.statements.find(
  (stmt): stmt is ts.FunctionDeclaration =>
    ts.isFunctionDeclaration(stmt) && stmt.name?.text === "main"
);

if (mainFunction) {
  findFunctionCalls(mainFunction, sourceFile);
}
