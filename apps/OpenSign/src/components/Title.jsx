import { useLocation, matchPath } from "react-router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useManifestUrl } from "../hook/useManifestUrl";

const TITLE_MAP = {
  "/": "login",

  // Home layout
  "/dashboard/35KBoSgoAK": "sidebar.Dashboard",
  "/form/sHAnZphf69": "Sign Yourself",
  "/form/8mZzFxbG1z": "Request Signatures",
  "/form/template": "New Template",
  "/report/6TeaPr321t": "sidebar.Templates",
  "/report/4Hhwbp482K": "report-name.Need your sign",
  "/report/1MwEuxLEkF": "report-name.In-progress documents",
  "/report/kQUoW4hUXz": "report-name.Completed Documents",
  "/report/ByHuevtCFY": "report-name.Drafts",
  "/report/UPr2Fm5WY3": "report-name.Declined Documents",
  "/report/zNqBHXHsYH": "report-name.Expired Documents",
  "/report/contacts": "sidebar.Contactbook",
  "/drive": "Drive",
  "/managesign": "sidebar.Settings-Children.My Signature",
  "/preferences": "sidebar.Settings-Children.Preferences",
  "/users": "sidebar.Settings-Children.Users",
  "/profile": "profile",
  "/changepassword": "change-password",
  "/verify-document": "verify-document",

  "/signaturePdf/:docId": "Sign Yourself",
  "/placeHolderSign/:docId": "Request Signatures",
  "/template/:templateId": "New Template",
  "/recipientSignPdf/:docId": "Request Signatures",
  "/recipientSignPdf/:docId/:contactBookId": "Request Signatures",
  "/load/recipientSignPdf/:docId/:contactBookId": "Request Signatures",

  // Standalone
  "/debugpdf": "Debug Pdf",
  "/forgetpassword": "forgot-password",
  "/success": "success",
  "/addadmin": "add-admin",
  "/upgrade-2.1": "add-admin",
  "/draftDocument": "New Document",
  "/login/:base64url": "Request Signatures"
};

function resolveTitle(pathname, override) {
  if (override) return override;
  for (const [pattern, label] of Object.entries(TITLE_MAP)) {
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return label;
    }
  }
  return "";
}

export default function Title() {
  const { pathname, state } = useLocation();
  const { t } = useTranslation();
  const appName = "MedceiSign";
  const logo = useMemo(() => localStorage.getItem("favicon"), []);
  const prefix = useMemo(
    () => resolveTitle(pathname, state?.title),
    [pathname, state?.title]
  );

  const title = useMemo(
    () => (prefix ? `${t(prefix)} - ${appName}` : appName),
    [t, prefix]
  );

  const manifestUrl = useManifestUrl(appName, logo);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={title} />
      {logo && <link rel="icon" type="image/png" href={logo} />}
      <link rel="manifest" href={manifestUrl} />
    </>
  );
}
