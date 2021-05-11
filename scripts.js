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

document.addEventListener("DOMContentLoaded", ()=> {
  const runtime = document.createElement("script");
  if (document.location.hostname === "localhost" || /local/.test(document.location.search)) {
     runtime.src = "http://localhost:8086/dfl-forms.bundle.js";
  } else {
    runtime.src = "https://dc.dev.dexilab.acrobat.com/dc-test-dropin/2.9.7_0.20.0/forms/dfl-forms.bundle.js";
  }
  runtime.addEventListener("load", (e) => {
    console.dir(e);
  }, false);
  runtime.addEventListener("error", () => {
    document.body.innerHTML = "<h1>You must be on the Adobe network to see this content</h1>";
  }, false);
  document.head.appendChild(runtime);
});
