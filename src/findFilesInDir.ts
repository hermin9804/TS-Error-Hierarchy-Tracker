import * as fs from "fs";
import * as path from "path";
// 파일 시스템을 검색하여 특정 확장자를 가진 파일 목록을 반환하는 함수
export function findFilesInDir(startPath: string, filter: RegExp): string[] {
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
