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
      if (formItem.Widget === 'radio-buttons') {
        items.push(fieldset(formItem));
      } else {
        items.push(field(formItem))
      }
    }
  );
  console.dir(dfl);
  window.adobe_dc_forms={templates:{[form]: dfl}};
  const formsRuntime = document.createElement("script");
  formsRuntime.src = "https://static.echocdnawspreview.com/signdx-cdn/latest/dfl/dfl-forms.bundle.js";
  formsRuntime.addEventListener(
    "load",
    () => {
      document.getElementById("loading").style.display = "none";
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
window.addEventListener('load', () => {
  const loading = `<div id="loading">
    <div id="loading-message">loading form: ${form}</div>
      <img src="/loading.gif" style="width:64px;height:64px;"></img>
    </div>
    <div id="dfl-form"></div>`
  document.body.innerHTML = loading;
});