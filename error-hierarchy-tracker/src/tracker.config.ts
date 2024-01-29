interface ITrackerConfig {
  srcPath: string;
  standardizedErrorFilePath: string;
  targetFileTypeList: string[];
  rootClassTypeList: string[];
  errorHandlingDecoratorName: string;
  getCapitalizedTargetFileTypeList: () => string[];
  getCapitalizedRootClassTypeList: () => string[];
  capitalizeStringList: (stringList: string[]) => string[];
}

export const TrackerConfig: ITrackerConfig = {
  srcPath: "../test-app/najuha-v2-be/src",
  standardizedErrorFilePath:
    "../test-app/najuha-v2-be/src/common/response/errorResponse.ts",
  targetFileTypeList: ["controller", "service", "strategy"],
  rootClassTypeList: ["controller"],
  errorHandlingDecoratorName: "TypedException",

  getCapitalizedTargetFileTypeList: function () {
    return this.capitalizeStringList(this.targetFileTypeList);
  },

  getCapitalizedRootClassTypeList: function () {
    return this.capitalizeStringList(this.rootClassTypeList);
  },

  capitalizeStringList: function (stringList: string[]) {
    return stringList.map((type) => `${type[0].toUpperCase()}${type.slice(1)}`);
  },
};
