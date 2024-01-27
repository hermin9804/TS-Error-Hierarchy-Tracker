import * as ts from "typescript";
import * as fs from "fs";
import { createMethodDependencyGraph } from "./createMethodDependencyGraph";
import { createmethodThrowableErrorMap } from "./createmethodThrowableErrorMap";
import { createHandledErrorMap } from "./createHandledErrorMap";
import { findFilesInDir } from "./findFilesInDir";
import { StringArrayMap } from "../types/stringArrayMap";
import { aggregateControllerErrorMap } from "./aggregateControllerErrorMap";
import { createUnhandledErrorMap } from "./createUnhandledErrorMap";
import { createUnnecessaryHandledErrorMap } from "./createUnnecessaryHandledErrorMap";

// Main Execution Function
async function main() {
  // const projectRoot = "..//test-app/test-app-nest/src";
  const projectRoot = "../test-app/najuha-v2-be/src";
  const targetFiles = findFilesInDir(
    projectRoot,
    /\.controller\.ts$|\.service\.ts$|\.strategy\.ts$/
  );

  // console.log("targetFiles", targetFiles);

  let methodDependencyGraph: StringArrayMap = {};
  let methodThrowableErrorMap: StringArrayMap = {};
  let handledErrorMap = {};

  for (const file of targetFiles) {
    const sourceCode = ts.sys.readFile(file) || "";
    const sourceFile = ts.createSourceFile(
      file,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    methodDependencyGraph = {
      ...methodDependencyGraph,
      ...createMethodDependencyGraph(sourceFile),
    };

    methodThrowableErrorMap = {
      ...methodThrowableErrorMap,
      ...createmethodThrowableErrorMap(sourceFile),
    };

    if (file.endsWith(".controller.ts")) {
      handledErrorMap = {
        ...handledErrorMap,
        ...createHandledErrorMap(sourceFile),
      };
    }
  }

  console.log(
    "methodDependencyGraph",
    JSON.stringify(methodDependencyGraph, null, 2)
  );

  console.log(
    "allmethodThrowableErrorMap",
    JSON.stringify(methodThrowableErrorMap, null, 2)
  );

  console.log("handledErrorMap", JSON.stringify(handledErrorMap, null, 2));

  const aggregatedControllerErrorMap = aggregateControllerErrorMap(
    methodDependencyGraph,
    methodThrowableErrorMap
  );
  console.log(
    "Aggregated Controller Error Map:",
    JSON.stringify(aggregatedControllerErrorMap, null, 2)
  );

  const unhandledErrorMap = createUnhandledErrorMap(
    aggregatedControllerErrorMap,
    handledErrorMap
  );
  console.log(
    "Unhandled Error Map:",
    JSON.stringify(unhandledErrorMap, null, 2)
  );

  const unnecessaryHandledErrorMap = createUnnecessaryHandledErrorMap(
    aggregatedControllerErrorMap,
    handledErrorMap
  );
  console.log(
    "Unnecessary Handled Error Map:",
    JSON.stringify(unnecessaryHandledErrorMap, null, 2)
  );

  const methodDependencyGraphJson = JSON.stringify(
    methodDependencyGraph,
    null,
    2
  );
  const methodThrowableErrorMapJson = JSON.stringify(
    methodThrowableErrorMap,
    null,
    2
  );
  fs.writeFileSync(
    "./result/methodDependencyGraph.json",
    methodDependencyGraphJson,
    "utf8"
  );
  fs.writeFileSync(
    "./result/methodThrowableErrorMap.json",
    methodThrowableErrorMapJson,
    "utf8"
  );
}

// Run the Main Function
main().catch(console.error);
