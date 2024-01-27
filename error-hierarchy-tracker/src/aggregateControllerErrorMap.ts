import { StringArrayMap } from "../types/stringArrayMap";

export function aggregateControllerErrorMap(
  methodDependencyGraph: StringArrayMap,
  methodThrowErrorMap: StringArrayMap
): StringArrayMap {
  const aggregatedErrors: StringArrayMap = {};

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
    (methodThrowErrorMap[method] || []).forEach((error) => errors.add(error));

    const dependencies = methodDependencyGraph[method];
    if (dependencies) {
      dependencies.forEach((dependency) => {
        collectErrors(dependency, visitedMethods).forEach((error) =>
          errors.add(error)
        );
      });
    }

    return Array.from(errors);
  }

  // Consider methods from any class ending with 'Controller'
  Object.keys(methodDependencyGraph).forEach((method) => {
    if (method.includes("Controller.")) {
      aggregatedErrors[method] = collectErrors(method);
    }
  });

  return aggregatedErrors;
}
