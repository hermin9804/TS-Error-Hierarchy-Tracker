import React from "react";
import ErrorHierarchyTree from "./ErrorHierarchyTree";
import transformDataForD3 from "./transformDataForD3";

const methodDependencyList = {
  "AppController.snsLogin": ["AppService.snsLogin"],
  "AppService.snsLogin": ["SnsAuthService.validate"],
  "KakaoStrategy.validate": [],
  "NaverStrategy.validate": [],
  "SnsAuthService.validate": [
    "KakaoStrategy.validate",
    "NaverStrategy.validate",
  ],
};

const throwAbleErrorList = {
  "AppController.snsLogin": [],
  "AppService.snsLogin": [],
  "KakaoStrategy.validate": [
    "new Error('KakaoStrategy Error!!')",
    "new Error('KakaoStrategy Error!!')",
  ],
  "NaverStrategy.validate": ["new Error('NaverStrategy Error!!')"],
  "SnsAuthService.validate": ["new Error('Not supported sns provider')"],
};

const App = () => {
  const d3Data = transformDataForD3(methodDependencyList, throwAbleErrorList);
  console.log(JSON.stringify(d3Data, null, 2));

  return (
    <div>
      <h1>Error Hierarchy Visualization</h1>
      <ErrorHierarchyTree data={d3Data[0]} />
    </div>
  );
};

export default App;
