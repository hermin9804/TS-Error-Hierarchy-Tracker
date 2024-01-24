import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

interface MethodDependencies {
  [methodName: string]: {
    class: string;
    method: string;
  }[];
}

interface DependencyGraph {
  [className: string]: MethodDependencies;
}

interface ThrowableErrors {
  [methodName: string]: string[];
}

interface ErrorsMap {
  [className: string]: ThrowableErrors;
}

interface MethodDetail {
  Errors: string[];
  Dependencies: { [methodName: string]: MethodDetail }; // Change this to match the structure
}

interface DependencyErrorTree {
  [methodName: string]: MethodDetail;
}

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

function createDependencyGraph(sourceFile: ts.SourceFile): DependencyGraph {
  const graph: DependencyGraph = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();
      graph[className] = {};

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();
          graph[className][methodName] = [];

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

              graph[className][methodName].push({
                class: dependencyClassName, // Use 'class' instead of 'service'
                method: dependencyMethodName,
              });
            }
          );
        }
      });
    }
  });

  return graph;
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

function findHandledErrors(sourceFile: ts.SourceFile): ErrorsMap {
  const errors: ErrorsMap = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      if (!errors[className]) {
        errors[className] = {};
      }

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();

          if (!errors[className][methodName]) {
            errors[className][methodName] = [];
          }

          const decorators = ts.getDecorators(member);
          decorators?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
              const decoratorName = decorator.expression.expression.getText();
              if (decoratorName === "HandleError") {
                const errorArgument =
                  decorator.expression.arguments[0].getText();
                errors[className][methodName].push(errorArgument);
              }
            }
          });
        }
      });
    }
  });

  return errors;
}

function findMethodErrors(sourceFile: ts.SourceFile): ErrorsMap {
  const errors: ErrorsMap = {};

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText();

      if (!errors[className]) {
        errors[className] = {};
      }

      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = member.name.getText();

          if (!errors[className][methodName]) {
            errors[className][methodName] = [];
          }

          findThrowStatements(member, (errorMessage) => {
            errors[className][methodName].push(errorMessage);
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
    // new Error(USER_EXISTS) -> USER_EXISTS 변환
    const cleanedErrorMessage = errorMessage
      .replace("new Error(", "")
      .replace(")", "");
    callback(cleanedErrorMessage);
  }
  ts.forEachChild(node, (childNode) =>
    findThrowStatements(childNode, callback)
  );
}

function createDependencyErrorTree(
  dependencyGraph: DependencyGraph,
  throwableErrors: ErrorsMap
) {
  const tree: DependencyErrorTree = {};

  function addMethodErrorsToTree(
    className: string,
    methodName: string,
    currentPath: { [methodName: string]: MethodDetail } // Updated parameter type
  ) {
    const fullMethodName = `${className}.${methodName}`;
    const methodErrors = throwableErrors[className]?.[methodName] || [];
    const dependencies = dependencyGraph[className]?.[methodName] || [];

    // Create a new MethodDetail object
    const methodDetail: MethodDetail = {
      Errors: methodErrors,
      Dependencies: {}, // Initialize the Dependencies property
    };

    // Assign the MethodDetail to the current path
    currentPath[fullMethodName] = methodDetail;

    // Recursively add dependencies and their errors
    for (const dep of dependencies) {
      addMethodErrorsToTree(
        dep.class,
        dep.method,
        currentPath[fullMethodName].Dependencies // Access the Dependencies property
      );
    }
  }

  for (const className of Object.keys(dependencyGraph)) {
    tree[className] = {
      Errors: [],
      Dependencies: {},
    };

    for (const methodName of Object.keys(dependencyGraph[className])) {
      addMethodErrorsToTree(
        className,
        methodName,
        tree[className].Dependencies
      );
    }
  }

  return tree;
}

function findUnhandledErrors(
  dependencyErrorTree: DependencyErrorTree,
  handledErrors: ErrorsMap
): { [fullMethodName: string]: string[] } {
  const unhandledErrors: { [fullMethodName: string]: string[] } = {};

  function collectErrorsFromSubtree(
    currentTree: DependencyErrorTree
  ): string[] {
    let errors: string[] = [];
    Object.values(currentTree).forEach((methodDetail) => {
      errors = errors.concat(methodDetail.Errors);
      errors = errors.concat(
        collectErrorsFromSubtree(methodDetail.Dependencies)
      );
    });
    return errors;
  }

  Object.entries(dependencyErrorTree).forEach(([className, classDetails]) => {
    if (className.endsWith("Controller")) {
      Object.entries(classDetails.Dependencies).forEach(
        ([methodName, methodDetail]) => {
          const fullMethodName = `${className}.${methodName}`;

          // Collect errors from subtree
          const subtreeErrors = collectErrorsFromSubtree(
            methodDetail.Dependencies
          );
          subtreeErrors.push(...methodDetail.Errors);

          // Calculate unhandled errors
          const methodHandledErrors =
            handledErrors[className]?.[methodName] || [];
          const methodUnhandledErrors = subtreeErrors.filter(
            (error) => !methodHandledErrors.includes(error)
          );

          if (methodUnhandledErrors.length > 0) {
            unhandledErrors[fullMethodName] = [
              ...new Set(methodUnhandledErrors),
            ]; // Remove duplicates
          }
        }
      );
    }
  });

  return unhandledErrors;
}

// Main Execution Function
async function main() {
  const projectRoot = "./src";
  const targetFiles = findFilesInDir(
    projectRoot,
    /\.controller\.ts$|\.service\.ts$/
  );

  let globalDependencyGraph = {};
  let globalThrowableErrors = {};
  let globalHandledErrors = {};

  for (const file of targetFiles) {
    const sourceCode = ts.sys.readFile(file) || "";
    const sourceFile = ts.createSourceFile(
      file,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const dependencyGraph = createDependencyGraph(sourceFile);
    globalDependencyGraph = { ...globalDependencyGraph, ...dependencyGraph };

    const throwableErrors = findMethodErrors(sourceFile);
    globalThrowableErrors = { ...globalThrowableErrors, ...throwableErrors };

    // Controller 에만 수행
    if (file.endsWith(".controller.ts")) {
      const handledErrors = findHandledErrors(sourceFile);
      globalHandledErrors = { ...globalHandledErrors, ...handledErrors };
    }
  }

  console.log(
    "globalDependencyGraph:",
    JSON.stringify(globalDependencyGraph, null, 2)
  );

  console.log(
    "globalThrowableErrors:",
    JSON.stringify(globalThrowableErrors, null, 2)
  );

  console.log(
    "globalHandledErrors:",
    JSON.stringify(globalHandledErrors, null, 2)
  );

  const dependencyErrorTree = createDependencyErrorTree(
    globalDependencyGraph,
    globalThrowableErrors
  );
  console.log(
    "dependencyErrorTree:",
    JSON.stringify(dependencyErrorTree, null, 2)
  );

  const unhandledErrors = findUnhandledErrors(
    dependencyErrorTree,
    globalHandledErrors
  );
  console.log("Unhandled Errors:", JSON.stringify(unhandledErrors, null, 2));
}

// Run the Main Function
main().catch(console.error);
