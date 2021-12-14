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

/**
 * Wraps each section in an additional {@code div}.
 * @param {[Element]} sections The sections
 */
function wrapSections(sections) {
  sections.forEach((div) => {
    if (!div.id) {
      const wrapper = document.createElement("div");
      wrapper.className = "section-wrapper";
      div.parentNode.appendChild(wrapper);
      wrapper.appendChild(div);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const token = connect((token) => {
    const runtime = document.createElement("script");
    runtime.src = "http://localhost:8086/dfl-forms.bundle.js";
    runtime.addEventListener(
      "load",
      (e) => {
        const main = document.querySelector("dfl-form-root > div");
        wrapSections(main.querySelectorAll(":scope > div"));

        const form = document.getElementsByTagName("dfl-form-root")[0];
        const formWrapper = document.createElement("div");
        formWrapper.className = "form-wrapper";
        form.parentNode.appendChild(formWrapper);
        formWrapper.appendChild(form);

        const checkboxes = main.querySelectorAll(".checkbox-input");
        checkboxes.forEach((checkbox) => {
          const label = document.getElementById(`label-for-${checkbox.id}`)
          checkbox.parentElement.appendChild(label);
          checkbox.parentElement.classList.add("fieldContainer");
        });

        const radioButtons = main.querySelectorAll("input[type='radio']");
        radioButtons.forEach((checkbox) => {
          const label = document.getElementById(`label-for-${checkbox.id}`)
          checkbox.parentElement.appendChild(label);
          checkbox.parentElement.classList.add("fieldContainer");
        });

        const body = document.getElementsByTagName("body")[0];
        const header = document.createElement("header");
        header.innerHTML = `<div class="header--nav--main- header nav main is-Loaded" data-block-select=".header">
  <div class="container">
    <div class="nav-container">
      <picture>
        <source media="(max-width: 400px)"
          srcset="./assets/header.png">
        <img
          src="./assets/header.png"
          loading="eager">
      </picture>
    </div>
  </div>
</div>`;
        body.insertBefore(header, body.firstChild);

        setTimeout(() => {
          document.querySelector("body").style.visibility = "visible";

          document
            .querySelector(".button-control")
            .addEventListener("click", () => {
              const firstName = document.getElementById("FirstName-0").value;
              const lastName = document.getElementById("LastName-0").value;
              const street = document.getElementById("street-0").value;
              const city = document.getElementById("city-0").value;
              const province = document.getElementById("province-0").value;
              const state = document.getElementById("state-0").value;
              const country = document.getElementById("country-0").value;
              const postalCode = document.getElementById("postalcode-0").value;
              const zipCode = document.getElementById("zipcode-0").value;

              const substanceUse = document.querySelector(
                'input[name="substanceUse"]:checked'
              ).value;

              const roleStillImages = document.getElementById("currentRole-stillImages-0").value;
              const role3dModels = document.getElementById("currentRole-3dModels-0").value;
              const roleWebsite = document.getElementById("currentRole-website-0").value;
              const roleARVR = document.getElementById("currentRole-arvr-0").value;
              const rolePrinting = document.getElementById("currentRole-printing-0").value;

              const painPoint = document.querySelector(
                'input[name="painPoint"]:checked'
              ).value;

              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              myHeaders.append("Authorization", `Bearer ${token}`);

              var raw = JSON.stringify({
                "values": [
                  [
                    firstName,
                    lastName,
                    street,
                    city,
                    province,
                    state,
                    country,
                    postalCode,
                    zipCode,
                    substanceUse,
                    roleStillImages,
                    role3dModels,
                    roleWebsite,
                    roleARVR,
                    rolePrinting,
                    painPoint
                  ]
                ]
              });

              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };

              fetch("https://graph.microsoft.com/v1.0/drives/b!s3ZzvSH33EKxLUmJDhnggVXh-0kbIBdLpwjrY_o2UHYG4iI4l3B1TICOn8VN3fj3/items/01PFYHN4JXRKJUPH4R2RE3Y7SWFQPATPUE/workbook/tables/intake_form/rows", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));

              setTimeout(() => {
                window.location = "http://localhost:3000/sko-modeler-beta-thankyou";
              }, 1000);
            });
        },
          false
        );
      }, 2000);

    runtime.addEventListener(
      "error",
      () => {
        document.body.innerHTML =
          "<h1>You must start the dc forms runtime to see this content</h1>";
      },
      false
    );
    document.head.appendChild(runtime);
  });
});