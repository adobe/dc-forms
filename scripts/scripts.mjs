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

import { connect } from './sharepoint.mjs';

document.addEventListener("DOMContentLoaded", ()=> {
  const token = connect((token) => {
    const runtime = document.createElement("script");
    if (document.location.hostname === "localhost" || /local/.test(document.location.search)) {
      runtime.src = "http://localhost:8086/dfl-forms.bundle.js";
    } else {
      runtime.src = "https://dc.dev.dexilab.acrobat.com/dc-test-dropin/2.22.4_0.36.0/forms/dfl-forms.bundle.js";
    }

    runtime.addEventListener("load", (e) => {
      document
        .querySelector(".button-control")
        .addEventListener("click", () => {
            const street = document.getElementById("street-0").value;
            const city = document.getElementById("city-0").value;
            const province = document.getElementById("province-0").value;
            const state = document.getElementById("state-0").value;
            const country = document.getElementById("country-0").value;
            const postalCode = document.getElementById("postalcode-0").value;
            const zipCode = document.getElementById("zipcode-0").value;

            const insurance1 = document.getElementById("ins1-0").checked;
            const insurance2 = document.getElementById("ins2-0").checked;
            const insurance3 = document.getElementById("ins3-0").checked;

            const insuranceTotal = document.getElementById("insuranceTotal-0").value;

            var raw = JSON.stringify({
              "values": [
                [
                  street,
                  country,
                  'FALSE',
                  insuranceTotal,
                  insurance3,
                  city,
                  state,
                  province,
                  zipCode,
                  insurance1,
                  new Date().toISOString().slice(0, 10),
                  '',
                  insurance2,
                  '',
                  0
                ]
              ]
            });

            var headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", `Bearer ${token}`);

            var requestOptions = {
              method: 'POST',
              headers: headers,
              body: raw,
              redirect: 'follow'
            };

            fetch("https://graph.microsoft.com/v1.0/drives/b!s3ZzvSH33EKxLUmJDhnggVXh-0kbIBdLpwjrY_o2UHYG4iI4l3B1TICOn8VN3fj3/items/01PFYHN4PERWNYLSREMFGZ4CYYX3NTCLAH/workbook/tables/intake_form/rows", requestOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => console.log('error', error));
          });
        });

      runtime.addEventListener("error", () => {
        document.body.innerHTML = "<h1>You must be on the Adobe network to see this content</h1>";
      }, false);
      document.head.appendChild(runtime);
    }, false);
});

