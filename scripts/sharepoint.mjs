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

import { PublicClientApplication } from './msal-browser-2.14.2.mjs';

const graphURL = 'https://graph.microsoft.com/v1.0';
const baseURI = 'https://graph.microsoft.com/v1.0/sites/adobe.sharepoint.com,7be4993e-8502-4600-834d-2eac96f9558e,1f8af71f-8465-4c46-8185-b0a6ce9b3c85/drive/root:/theblog';

let connectAttempts = 0;
let accessToken;

const sp = {
  clientApp: {
    auth: {
      clientId: 'e9ee15dd-53c7-4b61-a484-17dcaf5f42d7',
      authority: 'https://login.microsoftonline.com/fa7b1b5a-7b34-4387-94ae-d2c178decee1',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  },
  login: {
    redirectUri: '/auth.html',
  },
  api: {
    url: graphURL,
    file: {
      get: {
        baseURI,
      },
      download: {
        baseURI,
      },
      upload: {
        baseURI,
        method: 'PUT',
      },
      createUploadSession: {
        baseURI,
        method: 'POST',
        payload: {
          '@microsoft.graph.conflictBehavior': 'replace',
        },
      },
    },
    directory: {
      create: {
        baseURI,
        method: 'PATCH',
        payload: {
          folder: {},
        },
      },
    },
    batch: {
      uri: `${graphURL}/$batch`,
    },
  },
};

export async function connect(callback) {
  const publicClientApplication = new PublicClientApplication(sp.clientApp);

  const account = publicClientApplication.getAllAccounts()[0];

  const accessTokenRequest = {
    scopes: ['files.readwrite', 'sites.readwrite.all'],
    account,
  };

  try {
    const res = await publicClientApplication.acquireTokenSilent(accessTokenRequest);
    accessToken = res.accessToken;
    if (callback) await callback(accessToken);
  } catch (error) {
    console.log(error);
    // Acquire token silent failure, and send an interactive request
    if (error.name === 'InteractionRequiredAuthError') {
      try {
        const res = await publicClientApplication.acquireTokenPopup(accessTokenRequest);
        // Acquire token interactive success
        accessToken = res.accessToken;
        if (callback) {
          await callback(accessToken);
        }
      } catch (err) {
        connectAttempts += 1;
        if (connectAttempts === 1) {
          // Retry to connect once
          connect(callback);
        }
        // Give up
        throw new Error(`Cannot connect to Sharepoint: ${err.message}`);
      }
    }

    const res = await publicClientApplication.loginPopup(sp.login);
    accessToken = res.accessToken;
    if (callback) await callback(accessToken);
  }
}

function validateConnnection() {
  if (!accessToken) {
    throw new Error('You need to sign-in first');
  }
}