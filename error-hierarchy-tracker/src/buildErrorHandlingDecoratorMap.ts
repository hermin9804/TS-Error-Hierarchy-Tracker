import ts from "typescript";
import fs from "fs";
import { StringArrayMap } from "../types/stringArrayMap";
import { TrackerConfig } from "./tracker.config";

export function buildErrorHandlingDecoratorMap(
  assembledErrorMap: StringArrayMap
): StringArrayMap {
  const sourceFile = getStandardizedErrorFile();
  const standardizedErrorList = getStandardizedErrorList(sourceFile);

  return Object.entries(assembledErrorMap).reduce(
    (decoratorMap, [key, handlingErrorList]) => {
      const decorators = handlingErrorList.flatMap((handlingError) =>
        Object.entries(standardizedErrorList)
          .filter(([standardizedErrorName]) =>
            handlingError.includes(standardizedErrorName)
          )
          .map(([standardizedErrorName, { code }]) =>
            createDecoratorForError(standardizedErrorName, code)
          )
      );

      return {
        ...decoratorMap,
        [key]: decorators,
      };
    },
    {} as StringArrayMap
  );
}

function createDecoratorForError(errorName: string, errorCode: string): string {
  return `@TypedException<${errorName}>(${errorCode}, '${errorName}')`;
}

function getStandardizedErrorList(sourceFile: ts.SourceFile) {
  const interfaces: Record<string, Record<string, string>> = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.heritageClauses) {
      node.heritageClauses.forEach((clause) => {
        clause.types.forEach((type) => {
          if (type.expression.getText(sourceFile) === "ErrorResponse") {
            const interfaceName = node.name.getText(sourceFile);
            const propertiesObj: Record<string, string> = {};

            node.members.filter(ts.isPropertySignature).forEach((member) => {
              const propertyName = member.name.getText(sourceFile);
              const propertyType =
                member.type?.getText(sourceFile) || "unknown";
              propertiesObj[propertyName] = propertyType;
            });

            interfaces[interfaceName] = propertiesObj;
          }
        });
      });
    }
  });

  //   const keys = Object.keys(interfaces);
  //   console.log(interfaces[keys[0]].code);
  return interfaces;
}

function getStandardizedErrorFile() {
  const errorListPath = TrackerConfig.standardizedErrorFilePath;

  if (!fs.existsSync(errorListPath)) {
    throw new Error(`File not found: ${errorListPath}`);
  }

  const sourceCode = fs.readFileSync(errorListPath, "utf8");
  const sourceFile = ts.createSourceFile(
    errorListPath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  return sourceFile;
}
