import { StringArrayMap } from "../types/stringArrayMap";

// const RootClassSuffixList = ["Controller", "Service", "Strategy"];
const RootClassSuffixList = ["Controller"];

export function assembleHierarchyErrorMap(
  methodDependencyGraph: StringArrayMap,
  methodThrowErrorMap: StringArrayMap
): StringArrayMap {
  const assembledErrors: StringArrayMap = {};

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

  // Consider methods from any class type specified in RootClassSuffixList
  Object.keys(methodDependencyGraph).forEach((method) => {
    const isRootClassMethod = RootClassSuffixList.some((suffix) =>
      method.includes(`${suffix}.`)
    );
    if (isRootClassMethod) {
      assembledErrors[method] = collectErrors(method);
    }
  });

  return assembledErrors;
}
