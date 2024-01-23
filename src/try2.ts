import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

type MethodDependencyList = {
  [fullMethodName: string]: string;
};

type ThrowAbleErrorList = {
  [fullMethodName: string]: string[];
};

type HandledErrorList = {
  [fullMethodName: string]: string[];
};

type UnhandledErrorList = {
  [fullMethodName: string]: string[];
};

// Utility Functions
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

function createMethodDependencyList(
  sourceFile: ts.SourceFile
): MethodDependencyList {
  const dependencyList: { [key: string]: string } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          const fullMethodName = `${className}.${methodName}`;

          findServiceMethodCalls(
            member,
            (dependencyClassName, dependencyMethodName) => {
              if (dependencyClassName === "this") {
                dependencyClassName = className; // Replace 'this' with the current class name
              } else if (dependencyClassName.startsWith("this.")) {
                dependencyClassName = dependencyClassName.slice(5); // Remove 'this.'
                dependencyClassName =
                  dependencyClassName.charAt(0).toUpperCase() +
                  dependencyClassName.slice(1);
              }

              const fullDependencyName = `${dependencyClassName}.${dependencyMethodName}`;
              dependencyList[fullMethodName] = fullDependencyName;
            }
          );
        }
      });
    }
  });

  return dependencyList;
}

function findServiceMethodCalls(
  node: ts.Node,
  callback: (serviceClassName: string, serviceMethodName: string) => void
) {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression)
  ) {
    const serviceClassName = node.expression.expression.getText();
    const serviceMethodName = node.expression.name.getText();
    callback(serviceClassName, serviceMethodName);
  }
  ts.forEachChild(node, (childNode) =>
    findServiceMethodCalls(childNode, callback)
  );
}

function findMethodErrors(sourceFile: ts.SourceFile): {
  [key: string]: string[];
} {
  const errors: { [key: string]: string[] } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          const fullMethodName = `${className}.${methodName}`;
          errors[fullMethodName] = [];

          findThrowStatements(member, (errorMessage) => {
            // Assuming errorMessage is cleaned in findThrowStatements
            errors[fullMethodName].push(errorMessage);
          });
        }
      });
    }
  });

  return errors;
}

function extractPattern(inputString: string): string | null {
  const pattern = /[A-Z_]+/g;
  const matches = inputString.match(pattern);
  const snakes = matches?.filter((match) => match.length > 1);
  return snakes ? snakes[0] : null;
}

function findThrowStatements(
  node: ts.Node,
  callback: (errorMessage: string) => void
) {
  if (ts.isThrowStatement(node) && node.expression) {
    const errorMessage = node.expression.getText();
    const cleanedErrorMessage = extractPattern(errorMessage) || errorMessage;
    console.log("cleanedErrorMessage", cleanedErrorMessage);
    callback(cleanedErrorMessage);
  }
  ts.forEachChild(node, (childNode) =>
    findThrowStatements(childNode, callback)
  );
}

function findHandledErrors(sourceFile: ts.SourceFile): {
  [key: string]: string[];
} {
  const errors: { [key: string]: string[] } = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          const fullMethodName = `${className}.${methodName}`;
          errors[fullMethodName] = [];

          const decorators = ts.getDecorators(member);
          decorators?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const decoratorName = decorator.expression.expression.getText();
              if (decoratorName === "HandleError") {
                const errorArgument =
                  decorator.expression.arguments[0].getText();
                // Clean the error argument if necessary
                errors[fullMethodName].push(errorArgument);
              }
            }
          });
        }
      });
    }
  });

  return errors;
}

function findUnhandledErrors(
  methodDependencyList: MethodDependencyList,
  throwAbleErrorList: ThrowAbleErrorList,
  handledErrorList: HandledErrorList
) {
  const unhandledErrorList: UnhandledErrorList = {};

  function collectErrorsForMethod(
    method: string,
    visitedMethods = new Set<string>()
  ): string[] {
    const allErrors = new Set<string>();
    let currentMethod = method;

    while (currentMethod && throwAbleErrorList[currentMethod]) {
      // Check for circular dependencies
      if (visitedMethods.has(currentMethod)) {
        console.warn(`Circular dependency detected at ${currentMethod}`);
        break;
      }
      visitedMethods.add(currentMethod);

      throwAbleErrorList[currentMethod].forEach((error) =>
        allErrors.add(error)
      );
      currentMethod = methodDependencyList[currentMethod];
    }

    return Array.from(allErrors) as string[];
  }

  for (const [method, errors] of Object.entries(handledErrorList)) {
    const allErrors = collectErrorsForMethod(method);
    const handledErrors = new Set(errors);
    const unhandledErrors = allErrors.filter(
      (error: string) => !handledErrors.has(error)
    );

    if (unhandledErrors.length > 0) {
      unhandledErrorList[method] = unhandledErrors;
    }
  }

  return unhandledErrorList;
}

function aggregateControllerErrors(
  methodDependencyList: MethodDependencyList,
  throwAbleErrorList: ThrowAbleErrorList
): { [controllerMethod: string]: string[] } {
  const aggregatedErrors: { [controllerMethod: string]: string[] } = {};

  function collectErrors(
    method: string,
    visitedMethods = new Set<string>()
  ): string[] {
    // Avoid circular dependencies
    if (visitedMethods.has(method)) {
      return [];
    }
    visitedMethods.add(method);

    const errors = new Set<string>();
    (throwAbleErrorList[method] || []).forEach((error) => errors.add(error));

    const dependency = methodDependencyList[method];
    if (dependency) {
      collectErrors(dependency, visitedMethods).forEach((error) =>
        errors.add(error)
      );
    }

    return Array.from(errors);
  }

  // Assume controller methods are those within '*Controller.*'
  Object.keys(methodDependencyList).forEach((method) => {
    if (method.includes("Controller.")) {
      aggregatedErrors[method] = collectErrors(method);
    }
  });

  return aggregatedErrors;
}

function findUnnecessaryHandledErrors(
  aggregatedControllerErrors: { [controllerMethod: string]: string[] },
  handledErrorList: { [controllerMethod: string]: string[] }
): { [controllerMethod: string]: string[] } {
  const unnecessaryHandledErrors: { [controllerMethod: string]: string[] } = {};

  Object.keys(handledErrorList).forEach((method) => {
    const handledErrors = handledErrorList[method];
    const actualErrors = aggregatedControllerErrors[method] || [];

    const unnecessaryErrors = handledErrors.filter(
      (error) => !actualErrors.includes(error)
    );

    if (unnecessaryErrors.length > 0) {
      unnecessaryHandledErrors[method] = unnecessaryErrors;
    }
  });

  return unnecessaryHandledErrors;
}

// Main Execution Function
async function main() {
  const projectRoot = "./src";
  // service, controller, strategy
  const targetFiles = findFilesInDir(
    projectRoot,
    /\.controller\.ts$|\.service\.ts$|\.strategy\.ts$/
  );

  console.log("targetFiles", targetFiles);

  let methodDependencyList = {};
  let throwAbleErrorList = {};
  let handledErrorList = {};

  for (const file of targetFiles) {
    const sourceCode = ts.sys.readFile(file) || "";
    const sourceFile = ts.createSourceFile(
      file,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    methodDependencyList = {
      ...methodDependencyList,
      ...createMethodDependencyList(sourceFile),
    };

    throwAbleErrorList = {
      ...throwAbleErrorList,
      ...findMethodErrors(sourceFile),
    };

    if (file.endsWith(".controller.ts")) {
      handledErrorList = {
        ...handledErrorList,
        ...findHandledErrors(sourceFile),
      };
    }
  }
  console.log(
    "methodDependencyList",
    JSON.stringify(methodDependencyList, null, 2)
  );

  console.log(
    "throwAbleErrorList",
    JSON.stringify(throwAbleErrorList, null, 2)
  );

  console.log("handledErrorList", JSON.stringify(handledErrorList, null, 2));

  const unhandledErrorList = findUnhandledErrors(
    methodDependencyList,
    throwAbleErrorList,
    handledErrorList
  );
  console.log(
    "Unhandled Error List:",
    JSON.stringify(unhandledErrorList, null, 2)
  );

  // Usage Example
  const aggregatedControllerErrors = aggregateControllerErrors(
    methodDependencyList,
    throwAbleErrorList
  );
  console.log(
    "Aggregated Controller Errors:",
    JSON.stringify(aggregatedControllerErrors, null, 2)
  );

  const unnecessaryHandledErrors = findUnnecessaryHandledErrors(
    aggregatedControllerErrors,
    handledErrorList
  );
  console.log(
    "Unnecessary Handled Errors:",
    JSON.stringify(unnecessaryHandledErrors, null, 2)
  );
}

// Run the Main Function
main().catch(console.error);
