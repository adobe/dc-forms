/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const searchParams = new URLSearchParams(document.location.search);
const form = searchParams.get("form");
/*
 * Create a DFL field from a spreadsheet row
 */
function field(formItem) {
  const keyMap = {
    "Calculation": "rule.value",
    "Default Value": "default",
    "Display Format": "displayFormat",
    "Enum Names": "enumNames",
    "Enum Values": "enum",
    "How to Store Empty Field Value": "emptyValue",
    "Hyperlink URL": "url",
    "Label": "title",
    "Minimum Length": "minLength",
    "Minimum Value": "minimum",
    "Maximum Length": "maxLength",
    "Maximum Value": "maximum",
    "Name": "name",
    "Placeholder Text": "placeholder",
    "Read Only": "readOnly",
    "Read Only Rule": "rule.readOnly",
    "Required Rule": "rule.required",
    "Regular Expression Validation": "pattern",
    "Required": "required",
    "Role": "role",
    "Tool Tip": "tooltip",
    "Type": "type",
    "Validation Message": "validationMessage",
    "Visible": "presence",
    "Visibility Rule": "rule.presence",
    "Widget": "viewType",
  };
  const dflField = {};

  Object.entries(formItem).forEach(([name, value]) => {
    if (!value) return;
    const key = keyMap[name];
    if (!key) {
        console.error(`key not found: ${name}`);
    }
    if (["enum", "enumNames"].includes(key)) {
      dflField[key] = value.split(/[\n\r]+/);
    } else if (["required", "readOnly"].includes(key)) {
      dflField[key] = Boolean(value);
    } else if (key === "viewType") {
      const suffix = value === "datetime" ? "-text" : "";
      dflField[key] = `dfl-${value}${suffix}`;
    } else if (key.startsWith("rule.")) {
      const rule = key.split(".")[1];
      dflField.rules = dflField.rules || {};
      dflField.rules[rule] = {expression: value};
    } else if (key === "validationMessage") {
      dflField[key] = {};
      // For simplicity use a single message for all validation errors (except required)
      ["default",
      "type",
      "pattern",
      "minimum",
      "maximum",
      "maxLength",
      "minLength",
      "invalidEnum",
      "displayFormat"].forEach(m => dflField[key][m] = value);
    } else {
      dflField[key] = value;
    }
  });
  return dflField;
}

/*
 * Create a fieldset/radio button group from a spreadsheet row
 */
function fieldset(formItem) {
  const fldset = field(formItem);
  fldset.viewType = "dfl-fieldset";
  fldset.items = fldset.enum.map(f => ({
    // TODO: Should handle validations here as well
    viewType: "dfl-radio-button",
    name: fldset.name,
    enum: [f],
  }));
  (fldset.enumNames || []).forEach((n, i) => fldset.items[i].title = n);
  ["name", "enum", "enumValues"].forEach(p => delete fldset[p]);

  return fldset;
}
// translate from spreadsheet JSON to DFL
function createDFL(spreadsheetDefinition) {
  const dfl =
  {
    "css": [
      "default.css"
    ],
    "data": {},
    "form": {
      "items": []
    }
  };
  const items = dfl.form.items;
  spreadsheetDefinition.data.forEach(formItem => {
      if (formItem.Widget === "radio-buttons") {
        items.push(fieldset(formItem));
      } else {
        items.push(field(formItem))
      }
    }
  );
  console.dir(dfl);
  window.adobe_dc_forms={templates:{[form]: dfl}};
  const formsRuntime = document.createElement("script");
  // formsRuntime.src = "https://static.echocdnawspreview.com/signdx-cdn/latest/dfl/dfl-forms.bundle.js";
  formsRuntime.src = "/dfl-forms.bundle.js";
  formsRuntime.addEventListener(
    "load",
    () => {
      document.body.innerHTML = "";
      document.body.id = "dfl-form";
      document.body.addEventListener("submit", e => {
        e.preventDefault();
        const sheet = e.submitter.closest("dfl-button").model.formElement.url;
        const data = window.adobe_dc_forms.formHost.data;
        const postData = {
          data: Object.entries(data).map(([name, value]) => ({name, value})),
          // sheet: "https://adobe.sharepoint.com/:x:/r/sites/dc-forms/Shared%20Documents/publish/postalResults.xlsx?d=w859b8de424ca4d619e0b18bedb312c07&csf=1&web=1&e=Zl19HL"
          sheet
        };
        console.dir(postData);
        const url = "https://ccgrowth.servicebus.windows.net/formsink/messages";
        fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "SharedAccessSignature sr=https://ccgrowth.servicebus.windows.net/formsink/messages&sig=RFndMU/yHZrlchNBfHlIdulld4URAgUAQdAlqVLf1Bw=&se=1634259041&skn=send"
          },
          body: JSON.stringify(postData),
        });
      });
      window.document.dispatchEvent(new Event("DOMContentLoaded"));
    },
    false
  );
  document.head.appendChild(formsRuntime);
}

if (form) {
  const formJSON = document.location.hostname === "localhost" ?
    `http://localhost:3000/${form}.json` :
    `https://dc-forms--adobe.hlx.page/${form}.json`;
  fetch(formJSON).then(response => {
    if (!response.ok) {
      const pre = document.createElement("pre");
      pre.innerHTML = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        url: response.url
      }, null, 2);
      document.body.appendChild(pre);

      return null;
    }
    return response.json();
  }).then(spreadsheetDefinition => {
    spreadsheetDefinition && createDFL(spreadsheetDefinition);
  });
}
function load() {
  window.removeEventListener("load", load);
  if (document.body.id !== "dfl-form") {
    const loading = `<div id="loading">
      <div id="loading-message">loading form: ${form}</div>
        <img src="/loading.gif" style="width:64px;height:64px;"></img>
      </div>`;
    document.body.style.backgroundColor = "white";
    document.body.innerHTML = loading;
  }
}
window.addEventListener("load", load);
