import * as ts from "typescript";

function findThrowStatements(node: ts.Node) {
  if (ts.isThrowStatement(node)) {
    console.log("Throw Statement found:", node.expression.getText());
  }

  ts.forEachChild(node, findThrowStatements);
}

// 파일에서 TypeScript 소스를 읽어옵니다.
const fileName = "./src/throw-error.ts";
const sourceCode = ts.sys.readFile(fileName) || "";

// 소스 코드를 사용하여 SourceFile 객체를 생성합니다.
const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

findThrowStatements(sourceFile);
