import * as fs from "fs";
import { createMethodDependencyGraph } from "./createMethodDependencyGraph";
import { createMethodThrowErrorMap } from "./createMethodThrowErrorMap";
import { createHandledErrorMap } from "./createHandledErrorMap";
import { StringArrayMap } from "../types/stringArrayMap";
import { assembleHierarchyErrorMap } from "./assembleHierarchyErrorMap";
import { createUnhandledErrorMap } from "./createUnhandledErrorMap";
import { createUnnecessaryHandledErrorMap } from "./createUnnecessaryHandledErrorMap";
import { getSourceFileList } from "./getSourceFileList";

// Main Execution Function
async function main() {
  const sourceFileList = getSourceFileList();

  const methodDependencyGraph: StringArrayMap =
    createMethodDependencyGraph(sourceFileList);
  // console.log(
  //   "methodDependencyGraph",
  //   JSON.stringify(methodDependencyGraph, null, 2)
  // );

  const methodThrowErrorMap: StringArrayMap =
    createMethodThrowErrorMap(sourceFileList);
  // console.log(
  //   "methodThrowErrorMap",
  //   JSON.stringify(methodThrowErrorMap, null, 2)
  // );

  const handledErrorMap: StringArrayMap = createHandledErrorMap(sourceFileList);
  // console.log("handledErrorMap", JSON.stringify(handledErrorMap, null, 2));

  const assembledrrorMap = assembleHierarchyErrorMap(
    methodDependencyGraph,
    methodThrowErrorMap
  );
  // console.log(
  //   "Assembled Error Map:",
  //   JSON.stringify(assembledrrorMap, null, 2)
  // );

  const unhandledErrorMap = createUnhandledErrorMap(
    assembledrrorMap,
    handledErrorMap
  );
  // console.log(
  //   "Unhandled Error Map:",
  //   JSON.stringify(unhandledErrorMap, null, 2)
  // );

  const unnecessaryHandledErrorMap = createUnnecessaryHandledErrorMap(
    assembledrrorMap,
    handledErrorMap
  );
  // console.log(
  //   "Unnecessary Handled Error Map:",
  //   JSON.stringify(unnecessaryHandledErrorMap, null, 2)
  // );

  const methodDependencyGraphJson = JSON.stringify(
    methodDependencyGraph,
    null,
    2
  );
  const methodThrowErrorMapJson = JSON.stringify(methodThrowErrorMap, null, 2);
  fs.writeFileSync(
    "./result/methodDependencyGraph.json",
    methodDependencyGraphJson,
    "utf8"
  );
  fs.writeFileSync(
    "./result/methodThrowErrorMap.json",
    methodThrowErrorMapJson,
    "utf8"
  );
}

// Run the Main Function
main().catch(console.error);
