import * as fs from "fs";
import * as path from "path";
import { TrackerConfig } from "./tracker.config";
import ts from "typescript";

export const getSourceFileList = () => {
  // build regex from tracker.config.ts
  // /\.controller\.ts$|\.service\.ts$|\.strategy\.ts$/
  const targetFileRegex = new RegExp(
    `\\.(${TrackerConfig.targetFileTypeList.join("|")})\\.ts$`
  );
  const targetFileList = findFilesInDir(TrackerConfig.srcPath, targetFileRegex);

  let sourceFileList: ts.SourceFile[] = [];
  for (const file of targetFileList) {
    const sourceCode = ts.sys.readFile(file) || "";
    const sourceFile = ts.createSourceFile(
      file,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );
    sourceFileList.push(sourceFile);
  }
  return sourceFileList;
};

function findFilesInDir(startPath: string, filter: RegExp): string[] {
  let results: string[] = [];

  if (!fs.existsSync(startPath)) {
    console.log("Directory not found: ", startPath);
    return results;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter));
    } else if (filter.test(filename)) {
      results.push(filename);
    }
  }
  return results;
}
