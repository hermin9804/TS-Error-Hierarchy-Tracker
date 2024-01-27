import { StringArrayMap } from "../types/stringArrayMap";

export function createUnnecessaryHandledErrorMap(
  aggregatedControllerErrorMap: StringArrayMap,
  handledErrorMap: StringArrayMap
): StringArrayMap {
  const unnecessaryHandledErrorMap: StringArrayMap = {};

  Object.keys(handledErrorMap).forEach((method) => {
    const handledErrors = handledErrorMap[method];
    const actualErrors = aggregatedControllerErrorMap[method] || [];

    const unnecessaryErrors = handledErrors.filter(
      (error) => !actualErrors.includes(error)
    );

    if (unnecessaryErrors.length > 0) {
      unnecessaryHandledErrorMap[method] = unnecessaryErrors;
    }
  });

  return unnecessaryHandledErrorMap;
}
