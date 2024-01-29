interface ITrackerConfig {
  srcPath: string;
  targetFileTypeList: string[];
  rootClassTypeList: string[];
  getCapitalizedTargetFileTypeList: () => string[];
  getCapitalizedRootClassTypeList: () => string[];
  capitalizeStringList: (stringList: string[]) => string[];
}

export const TrackerConfig: ITrackerConfig = {
  srcPath: "../test-app/najuha-v2-be/src",
  targetFileTypeList: ["controller", "service", "strategy"],
  rootClassTypeList: ["controller"],

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
