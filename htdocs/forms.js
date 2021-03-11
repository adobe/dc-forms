const searchParams = new URLSearchParams(document.location.search);
console.log(document.location);
const form = searchParams.get('form');

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
  const keyMap = {
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
  }
  const items = dfl.form.items;
  spreadsheetDefinition.data.forEach(formItem => {
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
        } else if (key === 'viewType') {
          dflField[key] = `dfl-${value}`;
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
      items.push(dflField);
    }
  );
  console.dir(dfl);
  window.adobe_dc_forms={templates:{[form]: dfl}};
  const formLocation = document.createElement("div");
  formLocation.id = "dfl-form";
  document.body.appendChild(formLocation);
  const formsRuntime = document.createElement("script");
  formsRuntime.src = "https://dc.dev.dexilab.acrobat.com/dcformsruntime/dfl-forms.bundle.js";
  formsRuntime.addEventListener(
    "load",
    () => {
      window.document.dispatchEvent(new Event("DOMContentLoaded"));
    },
    false
  );
  document.head.appendChild(formsRuntime);
}

if (form) {
  const formJSON = document.location.hostname === 'localhost' ?
    `http://localhost:3000/${form}.json` :
    `https://dc-forms--adobe.hlx.page/${form}.json`;
  fetch(formJSON).then(response => response.json()).then(spreadsheetDefinition => {
    createDFL(spreadsheetDefinition);
  });
}

