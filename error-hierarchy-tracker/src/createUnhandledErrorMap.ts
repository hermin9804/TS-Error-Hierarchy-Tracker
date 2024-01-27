import { StringArrayMap } from "../types/stringArrayMap";

export function createUnhandledErrorMap(
  aggregatedControllerErrors: StringArrayMap,
  handledErrorMap: StringArrayMap
): StringArrayMap {
  const unhandledErrorMap: StringArrayMap = {};

  for (const [method, handledErrors] of Object.entries(handledErrorMap)) {
    const potentialErrors = aggregatedControllerErrors[method] || [];
    const actualUnhandledErrors = potentialErrors.filter(
      (error) => !handledErrors.includes(error)
    );

    if (actualUnhandledErrors.length > 0) {
      unhandledErrorMap[method] = actualUnhandledErrors;
    }
  }

  return unhandledErrorMap;
}
