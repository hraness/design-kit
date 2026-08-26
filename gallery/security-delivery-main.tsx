import { hydrateRoot } from "react-dom/client";

import {
  resolvedSecurityDeliveryResource,
  SecurityDeliveryApplication,
} from "./security-delivery-fixture.js";

declare global {
  interface Window {
    __hranessSecurityDeliveryRecoverableErrors?: string[];
  }
}

const target = document.querySelector("#app");
const hydrationModule = document.querySelector(
  "script[data-security-delivery-hydration]",
);
if (!(target instanceof HTMLElement)) {
  throw new Error("The security delivery hydration root is missing.");
}
if (!(hydrationModule instanceof HTMLScriptElement) || hydrationModule.nonce === "") {
  throw new Error("The security delivery hydration module has no nonce.");
}

const recoverableErrors: string[] = [];
window.__hranessSecurityDeliveryRecoverableErrors = recoverableErrors;
hydrateRoot(
  target,
  <SecurityDeliveryApplication
    nonce={hydrationModule.nonce}
    resource={resolvedSecurityDeliveryResource}
  />,
  {
    onRecoverableError(error) {
      recoverableErrors.push(error instanceof Error ? error.message : String(error));
    },
  },
);
