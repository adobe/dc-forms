/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
fetch("https://git.corp.adobe.com/pages/jbrinkma/dc-forms-runtime/dist/dfl-forms.bundle.js").then(r => {
  console.dir(r);
  console.log(r.text());
});
*/

const runtime = document.createElement("script");
//runtime.src = "http://git.corp.adobe.com/pages/jbrinkma/dc-forms-runtime/dist/dfl-forms.bundle.js";

runtime.src= "https://git.corp.adobe.com/login?return_to=https%3A%2F%2Fgit.corp.adobe.com%2Fpages%2Fjbrinkma%2Fdc-forms-runtime%2Fdist%2Fdfl-forms.bundle.js";
runtime.addEventListener("load", (e) => {
  console.dir(e);
}, false);
runtime.addEventListener("error", (e) => {
  console.log("error");
}, false);
document.head.appendChild(runtime);
