import * as ts from "typescript";

// 파일에서 TypeScript 소스를 읽어옵니다.
const fileName = "./src/example.ts";
const sourceCode = ts.sys.readFile(fileName) || "";

// 소스 코드를 사용하여 SourceFile 객체를 생성합니다.
const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

// SourceFile 객체를 콘솔에 출력하여 AST를 확인합니다.
console.log(sourceFile);
