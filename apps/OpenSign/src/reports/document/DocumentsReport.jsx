import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import recreatedoc from "../../assets/images/recreatedoc.png";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import ShareButton from "../../primitives/ShareButton";
import DatePicker from "../../components/DatePicker";
import Parse from "parse";
import {
  copytoData,
  fetchUrl,
  getSignedUrl,
  getTenantDetails,
  handleSignatureType,
  replaceMailVaribles,
  signatureTypes,
  openInNewTab,
  createDocument,
  getSignerEmail,
  defaultMailBody,
  defaultMailSubject
} from "../../constant/Utils";
import BulkSendUi from "../../components/bulksend/BulkSendUi";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { useTranslation } from "react-i18next";
import DownloadPdfZip from "../../primitives/DownloadPdfZip";
import { useElSize } from "../../hook/useElSize";
import PrefillWidgetModal from "../../components/pdf/PrefillWidgetsModal";
import LottieWithLoader from "../../primitives/DotLottieReact";
import * as utils from "../../utils";
import { RenderReportCell } from "../../primitives/RenderReportCell";
import CustomizeMail from "../../components/pdf/CustomizeMail";
import { useSelector } from "react-redux";
import EmailBodyEditor from "../../components/EmailBodyEditor";

const DocumentsReport = (props) => {
  const copyUrlRef = useRef(null);
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const appName = "MEDCEI";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { prefillImg, isBulkLoader } = useSelector((state) => state.widget);
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isRevoke, setIsRevoke] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isResendMail, setIsResendMail] = useState({});
  const [mail, setMail] = useState({ subject: "", body: "" });
  const [userDetails, setUserDetails] = useState({});
  const [isNextStep, setIsNextStep] = useState({});
  const [isBulkSend, setIsBulkSend] = useState({});
  const [templateDeatils, setTemplateDetails] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [isLoader, setIsLoader] = useState({});
  const [isModal, setIsModal] = useState({});
  const [reason, setReason] = useState("");
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [signatureType, setSignatureType] = useState([]);
  const [expiryDate, setExpiryDate] = useState(null);
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const [renameDoc, setRenameDoc] = useState("");
  const [isSuccess, setIsSuccess] = useState({});
  const [templateId, setTemplateId] = useState("");
  const [forms, setForms] = useState([]);
  const [xyPosition, setXyPosition] = useState([]);
  const [signerList, setSignerList] = useState([]);
  const [mailStatus, setMailStatus] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [documentId, setDocumentId] = useState("");
  const [isNewContact, setIsNewContact] = useState({ status: false, id: "" });
  const [isPrefillModal, setIsPrefillModal] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [error, setError] = useState("");
  const [isMailModal, setIsMailModal] = useState(false);
  const [customizeMail, setCustomizeMail] = useState({ body: "", subject: "" });
  const [defaultMail, setDefaultMail] = useState({ body: "", subject: "" });
  const [currUserId, setCurrUserId] = useState(false);
  const [documentDetails, setDocumentDetails] = useState();
  const [objInfoModal, setObjInfoModal] = useState({ title: "", info: "" });
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('[data-dropdown-root="1"]')) setIsOption({});
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const getPaginationRange = () => {
    const totalPageNumbers = 7;
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };

  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };

  const pageNumbers = getPaginationRange();

  useEffect(() => {
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  const fetchTenantDetails = utils.withSessionValidation(async () => {
    const user = JSON.parse(
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      )
    );
    if (user) {
      try {
        const tenantDetails = await getTenantDetails(user?.objectId);
        if (tenantDetails && tenantDetails === "user does not exist!") {
          alert(t("user-not-exist"));
        } else if (tenantDetails) {
          const signatureType = tenantDetails?.SignatureType || [];
          const filterSignTypes = signatureType?.filter(
            (x) => x.enabled === true
          );
          const subject = tenantDetails?.RequestSubject ?? "";
          const body = tenantDetails?.RequestBody ?? "";
          const userSubject = subject;
          const userBody = body;
          setCustomizeMail({
            subject: userSubject || defaultMailSubject,
            body: userBody || defaultMailBody
          });
          setDefaultMail({ subject: userSubject, body: userBody });
          return filterSignTypes;
        }
      } catch (e) {
        alert(t("user-not-exist"));
      }
    } else {
      alert(t("user-not-exist"));
    }
  });

  const handleURL = async (item, act) => {
    navigate(`/${act.redirectUrl}?docId=${item?.objectId}`);
  };

  const fetchTemplate = utils.withSessionValidation(async (templateId) => {
    try {
      const params = {
        templateId: templateId,
        include: ["Placeholders.signerPtr"]
      };
      const axiosRes = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getTemplate`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      );
      if (axiosRes) {
        return axiosRes;
      }
    } catch (e) {
      console.error("fetch template in report error", e);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });

  const navigatePageToDoc = utils.withSessionValidation(
    async (templateRes, placeholder, signer) => {
      setIsPrefillModal({});
      const res = await createDocument(
        [templateRes || templateDeatils],
        placeholder || xyPosition,
        signer || signerList,
        templateRes?.URL || templateDeatils?.URL
      );
      if (res.status === "success") {
        navigate(`/placeHolderSign/${res.id}`, {
          state: { title: "Use Template" }
        });
      } else {
        alert(t("something-went-wrong-mssg"));
      }
    }
  );

  const handleUseTemplate = async (templateId, item) => {
    try {
      const templateDeatils = await fetchTemplate(templateId);
      const templateData = templateDeatils.data && templateDeatils.data.result;
      if (!templateData.error) {
        setTemplateDetails(templateData);
        setXyPosition(templateData?.Placeholders);
        const signer = utils.handleSignersList(templateData);
        setSignerList(signer);

        await utils?.handleDisplaySignerList(
          templateData?.Placeholders,
          templateData?.Signers,
          setForms
        );
        setIsModal({});
        setIsPrefillModal({ [item.objectId]: true });
      } else {
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      }
    } catch (err) {
      console.error("use template error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };

  const handleActionBtn = utils.withSessionValidation(async (act, item) => {
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    } else if (act.action === "revoke") {
      setIsRevoke({ [item.objectId]: true });
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "resend") {
      setIsResendMail({ [item.objectId]: true });
    } else if (act.action === "rename") {
      setIsModal({ [`rename_${item.objectId}`]: true });
    } else if (act.action === "edit") {
      setIsModal({ [`edit_${item.objectId}`]: true });
    } else if (act.action === "saveastemplate") {
      setIsModal({ [`saveastemplate_${item.objectId}`]: true });
    } else if (act.action === "recreatedocument") {
      const isPrefill = item?.Placeholders?.some((p) => p.Role === "prefill");
      setError(isPrefill ? t("fix-resend-error") : "");
      setIsModal({ [`recreatedocument_${item.objectId}`]: true });
    } else if (act.action === "extendexpiry") {
      setExpiryDate(
        item?.ExpiryDate?.iso ? new Date(item?.ExpiryDate?.iso) : null
      );
      setIsModal({ [`extendexpiry_${item.objectId}`]: true });
    }
  });

  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = props.List;
  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = utils.withSessionValidation(async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Document";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsArchive: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.error("delete document error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });

  const handleClose = () => {
    setIsRevoke({});
    setIsDeleteModal({});
    setReason("");
  };

  const handleShare = (item) => {
    setActLoader({ [item.objectId]: true });
    const host = window.location.origin;
    const sendMail = item?.SendMail || false;
    const getUrl = (x) => {
      if (x?.signerObjId) {
        const encodeBase64 = btoa(
          `${item.objectId}/${getSignerEmail(x, item?.Signers)}/${x?.signerObjId}/${sendMail}`
        );
        return `${host}/login/${encodeBase64}`;
      } else {
        const encodeBase64 = btoa(`${item.objectId}/${x.email}`);
        return `${host}/login/${encodeBase64}`;
      }
    };
    const removePrefill = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const urls = removePrefill?.map((x) => ({
      email: getSignerEmail(x, item?.Signers) || x.email || "-",
      url: getUrl(x)
    }));
    setShareUrls(urls);
    setIsShare({ [item.objectId]: true });
  };

  const copytoclipboard = (text) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copybtn = (text, email) => {
    copytoData(text);
    if (copyUrlRef.current) {
      copyUrlRef.current.textContent = text;
    }
    setCopied({ [email]: true });
  };

  const handleRevoke = utils.withSessionValidation(async (item) => {
    const senderUser = localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
    const jsonSender = JSON.parse(senderUser);
    setIsRevoke({});
    setActLoader({ [`${item.objectId}`]: true });
    const data = {
      IsDeclined: true,
      DeclineReason: reason,
      DeclineBy: {
        __type: "Pointer",
        className: "_User",
        objectId: jsonSender?.objectId
      }
    };
    await axios
      .put(
        `${localStorage.getItem("baseUrl")}classes/contracts_Document/${item.objectId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      )
      .then(async (result) => {
        const res = result.data;
        if (res) {
          setActLoader({});
          showAlert("success", t("record-revoke-alert"));
          const upldatedList = props.List.filter(
            (x) => x.objectId !== item.objectId
          );
          props.setList(upldatedList);
        }
        setReason("");
      })
      .catch((err) => {
        console.error("decline document error", err);
        setReason("");
        showAlert("danger", t("something-went-wrong-mssg"));
        setActLoader({});
      });
  });

  const handleDownload = async (item) => {
    setActLoader({ [`${item.objectId}`]: true });
    const url = item?.SignedUrl || item?.URL || "";
    const pdfName =
      item?.Name?.length > 100
        ? item?.Name?.slice(0, 100)
        : item?.Name || "Document";
    const isCompleted = item?.IsCompleted || false;
    const formatId = item?.ExtUserPtr?.DownloadFilenameFormat;
    const docName = utils.buildDownloadFilename(formatId, {
      docName: pdfName,
      email: item?.ExtUserPtr?.Email,
      isSigned: isCompleted
    });
    const templateId = props?.ReportName === "Templates" && item.objectId;
    const docId = props?.ReportName !== "Templates" && item.objectId;
    if (url) {
      try {
        if (isCompleted) {
          setIsDownloadModal({ [item.objectId]: true });
        } else {
          const signedUrl = await getSignedUrl(url, docId, templateId);
          await fetchUrl(signedUrl, docName);
        }
        setActLoader({});
      } catch (err) {
        console.error("getsignedurl error", err);
        alert(t("something-went-wrong-mssg"));
        setActLoader({});
      }
    }
  };

  const handleSubjectChange = (subject, doc) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email,
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
    };
    const res = replaceMailVaribles(subject, "", variables);
    setMail((prev) => ({ ...prev, subject: res.subject }));
  };

  const handlebodyChange = (body, doc) => {
    const encodeBase64 = userDetails?.objectId
      ? btoa(`${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`)
      : btoa(`${doc.objectId}/${userDetails.Email}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: userDetails?.Name || "",
      receiver_email: userDetails?.Email || "",
      receiver_phone: userDetails?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc.ExtUserPtr.Company,
      signing_url: signPdf
    };
    const res = replaceMailVaribles("", body, variables);

    if (body) {
      setMail((prev) => ({ ...prev, body: res.body }));
    }
  };

  const handleNextBtn = (user, doc) => {
    const userdata = {
      Name: user?.signerPtr?.Name,
      Email: user.email ? user?.email : user.signerPtr?.Email,
      Phone: user?.signerPtr?.Phone,
      objectId: user?.signerPtr?.objectId
    };
    setUserDetails(userdata);
    const encodeBase64 = user.email
      ? btoa(`${doc.objectId}/${user.email}`)
      : btoa(`${doc.objectId}/${user.signerPtr.Email}/${user.signerPtr.objectId}`);
    const expireDate = doc.ExpiryDate.iso;
    const newDate = new Date(expireDate);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const signPdf = `${window.location.origin}/login/${encodeBase64}`;
    const variables = {
      document_title: doc.Name,
      note: doc?.Note || "",
      sender_name: doc.ExtUserPtr.Name,
      sender_mail: doc.ExtUserPtr.Email,
      sender_phone: doc.ExtUserPtr?.Phone || "",
      receiver_name: user?.signerPtr?.Name || "",
      receiver_email: user?.email ? user?.email : user?.signerPtr?.Email,
      receiver_phone: user?.signerPtr?.Phone || "",
      expiry_date: localExpireDate,
      company_name: doc?.ExtUserPtr?.Company || "",
      signing_url: signPdf
    };
    const subject =
      doc?.RequestSubject ||
      doc?.ExtUserPtr?.TenantId?.RequestSubject ||
      `{{sender_name}} has requested you to sign "{{document_title}}"`;
    const body =
      doc?.RequestBody ||
      doc?.ExtUserPtr?.TenantId?.RequestBody ||
      `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}} has requested you to review and sign <b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p><a href='{{signing_url}}' rel='noopener noreferrer' target='_blank'>Sign here</a></p><br><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team ${appName}</p><br></body> </html>`;
    const res = replaceMailVaribles(subject, body, variables);
    setMail((prev) => ({ ...prev, subject: res.subject, body: res.body }));
    setIsNextStep({ [user.Id]: true });
  };

  const handleResendMail = utils.withSessionValidation(async (e, doc, user) => {
    e.preventDefault();
    setActLoader({ [user?.Id]: true });
    const url = `${localStorage.getItem("baseUrl")}functions/sendmailv3`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      sessionToken: localStorage.getItem("accesstoken")
    };
    let params = {
      replyto: doc?.ExtUserPtr?.Email || "",
      extUserId: doc?.ExtUserPtr?.objectId,
      recipient: userDetails?.Email,
      subject: mail.subject,
      from: doc?.ExtUserPtr?.Email,
      html: mail.body
    };
    try {
      const res = await axios.post(url, params, { headers: headers });
      if (res?.data?.result?.status === "success") {
        showAlert("success", t("mail-sent-alert"));
        setIsResendMail({});
      } else {
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    } catch (err) {
      console.error("sendmail error", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setIsNextStep({});
      setUserDetails({});
      setActLoader({});
    }
  });

  const fetchUserStatus = (user, doc) => {
    const email = user.email ? user.email : user.signerPtr.Email;
    const audit = doc?.AuditTrail?.find((x) => x.UserPtr.Email === email);

    return (
      <div className="flex flex-row gap-2 justify-center items-center">
        <div className="flex justify-center items-center rounded-xl bg-green-100 text-green-800 shadow-sm w-[80px] h-[34px] cursor-default text-xs font-medium border border-green-200">
          {audit?.Activity ? audit?.Activity : "Awaited"}
        </div>

        <button
          onClick={() => handleNextBtn(user, doc)}
          className={
            audit?.Activity !== "Signed"
              ? "op-btn op-btn-primary op-btn-sm rounded-xl"
              : " text-transparent cursor-default pointer-events-none"
          }
          disabled={audit?.Activity === "Signed"}
        >
          {audit?.Activity !== "Signed" && "Resend"}
        </button>
      </div>
    );
  };

  const handleQuickSendClose = (status, count) => {
    setIsBulkSend({});
    if (status === "success") {
      showAlert("success", count + " " + t("document-sent-alert"));
    } else {
      showAlert("danger", t("something-went-wrong-mssg"));
    }
  };

  const handleUpdateExpiry = utils.withSessionValidation(async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (expiryDate) {
      const oldExpiryDate = item?.ExpiryDate?.iso
        ? new Date(item?.ExpiryDate?.iso)
        : null;
      const newExpiryDate = new Date(expiryDate);
      const hasOldExpiry =
        oldExpiryDate && !Number.isNaN(oldExpiryDate.getTime());
      if (!hasOldExpiry || newExpiryDate > oldExpiryDate) {
        setActLoader({ [`${item.objectId}`]: true });
        const updateExpiryDate = new Date(expiryDate).toISOString();
        const expiryIsoFormat = { iso: updateExpiryDate, __type: "Date" };
        try {
          const serverUrl = serverUrl_fn();
          const cls = "contracts_Document";
          const url = serverUrl + `/classes/${cls}/`;
          const body = { ExpiryDate: expiryIsoFormat };
          const res = await axios.put(url + item.objectId, body, {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          });
          if (res.data && res.data.updatedAt) {
            showAlert(
              "success",
              t("expiry-date-updated", {
                newexpirydate: new Date(expiryDate)?.toLocaleDateString()
              }),
              2000
            );
            if (props.ReportName === "Expired Documents") {
              const upldatedList = props.List.filter(
                (x) => x.objectId !== item.objectId
              );
              props.setList(upldatedList);
            }
          }
        } catch (err) {
          console.error("update expiry doc error", err);
          showAlert("danger", t("something-went-wrong-mssg"), 2000);
        } finally {
          setActLoader({});
          setExpiryDate();
          setIsModal({});
        }
      } else {
        showAlert("danger", t("expiry-date-error"), 2000);
      }
    } else {
      showAlert("danger", t("expiry-date-error"), 2000);
    }
  });

  const handleRenameDoc = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    setIsModal({});
    const className = "contracts_Document";
    try {
      const query = new Parse.Query(className);
      const docObj = await query.get(item.objectId);
      docObj.set("Name", renameDoc);
      await docObj.save();
      const updateList = props.List.map((x) =>
        x.objectId === item.objectId ? { ...x, Name: renameDoc } : x
      );
      props.setList(updateList);
      setActLoader({});
      showAlert("success", "Document updated", 2000);
    } catch (err) {
      showAlert("danger", t("something-went-wrong-mssg"), 2000);
      setActLoader({});
    }
  });

  const handleBtnVisibility = (act, item) => {
    if (!act.restrictBtn) {
      return true;
    } else if (
      act.restrictBtn === true &&
      item.ExtUserPtr?.objectId === extClass?.[0]?.objectId
    ) {
      return true;
    }
  };

  const handleCloseModal = () => {
    setError("");
    setIsModal({});
  };

  const handleSaveAsTemplate = utils.withSessionValidation(async (doc) => {
    try {
      const params = { docId: doc?.objectId };
      const templateRes = await Parse.Cloud.run("saveastemplate", params);
      setTemplateId(templateRes?.id);
      setIsSuccess({ [doc.objectId]: true });
    } catch (err) {
      console.error("saveastemplate error", err);
    } finally {
      setActLoader({});
    }
  });

  const handleCloseTemplate = () => {
    setTemplateId("");
    setIsSuccess({});
    handleCloseModal();
    setActLoader({});
    handleClose();
  };

  const handleBulkSendTemplate = utils.withSessionValidation(
    async (templateId, docId) => {
      setIsBulkSend({ [docId]: true });
      setIsLoader({ [docId]: true });
      try {
        const axiosRes = await fetchTemplate(templateId);
        const templateRes = axiosRes.data && axiosRes.data.result;
        const tenantSignTypes = await fetchTenantDetails();
        const docSignTypes = templateRes?.SignatureType || signatureTypes;
        const updatedSignatureType = await handleSignatureType(
          tenantSignTypes,
          docSignTypes
        );
        setSignatureType(updatedSignatureType);
        setPlaceholders(templateRes?.Placeholders);
        setTemplateDetails(templateRes);
        setIsLoader({});
      } catch (err) {
        console.error("fetch template in bulk modal error", err);
        setIsBulkSend({});
        showAlert("danger", t("something-went-wrong-mssg"));
      }
    }
  );

  const handleResendClose = () => {
    setIsResendMail({});
    setIsNextStep({});
    setUserDetails({});
  };

  const handleRecreateDoc = utils.withSessionValidation(async (item) => {
    setActLoader({ [item.objectId]: true });
    try {
      const res = await Parse.Cloud.run("recreatedoc", {
        docId: item.objectId
      });
      if (res) {
        openInNewTab(`/placeHolderSign/${res.objectId}`, "_self");
      }
    } catch (err) {
      handleCloseModal();
      showAlert("danger", err.message);
      console.error("create duplicate template error", err);
    } finally {
      setActLoader({});
    }
  });

  const restrictBtn = (item, act) => {
    return item.IsSignyourself && act.action === "recreatedocument"
      ? true
      : false;
  };

  const handleAddUser = (data, id) => {
    const signerPtr = {
      __type: "Pointer",
      className: "contracts_Contactbook",
      objectId: data.objectId
    };
    const updatePlaceHolder = xyPosition.map((x) => {
      if (x.signerObjId === id || x.Id === id) {
        return { ...x, signerPtr: signerPtr, signerObjId: data.objectId };
      }
      return { ...x };
    });
    setXyPosition(updatePlaceHolder);
    const updateSigner = signerList.map((y) => {
      if (y.objectId === id) {
        return data;
      } else if (y.Id === id) {
        return { ...y, ...data, className: "contracts_Contactbook" };
      }
      return { ...y };
    });
    setSignerList(updateSigner);

    if (isNewContact.status) {
      let newForm = [...forms];
      const label = `${data.Name}<${data.Email}>`;
      const index = newForm.findIndex((x) => x.value === id);
      newForm[index].label = label;
      newForm[index].value = id;
      setForms(newForm);
    }
  };

  const handleClosePrefillModal = () => {
    setIsPrefillModal(false);
    setActLoader({});
    setForms([]);
    setXyPosition([]);
  };

  const handlePrefillWidgetCreateDoc = async () => {
    setIsSubmit(true);
    const scale = 1;
    const key = Object.keys(isPrefillModal)[0];
    setActLoader({ [key]: true });
    const res = await utils?.handleCheckPrefillCreateDoc(
      xyPosition,
      signerList,
      setIsPrefillModal,
      scale,
      templateDeatils?.URL,
      [templateDeatils],
      prefillImg,
      extClass?.[0]?.UserId?.objectId
    );
    if (res?.status === "unfilled") {
      const emptyWidget = res?.emptyResponseObjects
        ?.map((item) => item.options.name)
        ?.join(", ");
      const timeInMiliSec = 6000;
      showAlert(
        "danger",
        t("prefill-unfilled-widget", {
          emptyWidget: emptyWidget ? `[${emptyWidget}]` : ""
        }),
        timeInMiliSec
      );
    } else if (res?.status === "unattach signer") {
      showAlert("danger", "please attach all role to signer");
    } else if (res?.status === "success") {
      setDocumentId(res.id);
      setActLoader({});
      setIsMailModal(true);

      try {
        await fetchTenantDetails();
      } catch (e) {
        console.error("fetchTenantDetails error", e);
        alert(t("user-not-exist"));
      }
    }
    setIsSubmit(false);
    setActLoader({});
  };

  const handleRecipientSign = (documentId, currentId) => {
    if (currentId) {
      navigate(`/recipientSignPdf/${documentId}/${currentId}`);
    } else {
      navigate(`/recipientSignPdf/${documentId}`);
    }
  };

  const handleShareList = () => {
    const shareLinkList = [];
    let signerMail = signerList;
    for (let i = 0; i < signerMail.length; i++) {
      const objectId = signerMail[i].objectId;
      const hostUrl = window.location.origin;
      const sendMail = false;
      const encodeBase64 = btoa(
        `${documentId}/${signerMail[i].Email}/${objectId}/${sendMail}`
      );
      let signPdf = `${hostUrl}/login/${encodeBase64}`;
      shareLinkList.push({ signerEmail: signerMail[i].Email, url: signPdf });
    }
    return shareLinkList.map((data, ind) => {
      return (
        <div
          className="flex flex-row justify-between items-center mb-1"
          key={ind}
        >
          {copied && <Alert type="success">{t("copied")}</Alert>}
          <span className="w-[220px] md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">
            {data.signerEmail}
          </span>
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={() => copytoclipboard(data.url)}
              type="button"
              className="flex flex-row items-center op-link op-link-primary"
            >
              <i className="fa-light fa-copy" />
              <span className=" hidden md:block ml-1 ">{t("copy-link")}</span>
            </button>
            <ShareButton
              title={t("sign-url")}
              text={t("sign-url")}
              url={data.url}
            >
              <i className="fa-light fa-share-from-square op-link op-link-secondary no-underline"></i>
            </ShareButton>
          </div>
        </div>
      );
    });
  };

  const handleRemovePrefill = (placeholders) => {
    const removePrefill = placeholders?.filter(
      (data) => data?.Role !== "prefill"
    );
    return removePrefill;
  };

  const handleCloseMail = () => {
    handleRecipientSign(documentId);
  };

  const handleWarning = (item) => {
    const isPrefill = item?.Placeholders?.some((x) => x?.Role === "prefill");
    if (isPrefill) {
      return (
        <span className="flex text-sm mt-3 text-red-500">
          {t("save-as-temp-warn")}
        </span>
      );
    }
  };

  const handleItemClick = (title, info) => {
    setObjInfoModal({ title, info });
  };

  const formatDateToDdMmmYyyy = (date) => {
    if (!date || Number.isNaN(new Date(date).getTime())) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/20 rounded-2xl z-30 backdrop-blur-[1px]">
          <Loader />
        </div>
      )}

      <div className="p-4 w-full bg-gradient-to-br from-green-50 to-white text-base-content rounded-2xl shadow-md border border-green-100">
        {alertMsg.message && (
          <div className="mb-3">
            <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
          </div>
        )}

        <div
          ref={titleRef}
          className="flex flex-row items-center justify-between my-2 mx-1 md:mx-2 text-[20px] md:text-[23px]"
        >
          <div className="font-semibold text-green-800 tracking-wide">
            {t(`report-name.${props.ReportName}`)}{" "}
            {props.report_help && (
              <span className="text-xs md:text-[13px] font-normal text-green-700">
                <Tooltip
                  id="report_help"
                  message={t(`report-help.${props.ReportName}`)}
                />
              </span>
            )}
          </div>

          <div className="flex flex-row justify-center items-center gap-3 mb-2">
            {titleElement?.width > 500 && (
              <div className="flex">
                <input
                  type="search"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-documents")}
                  onPaste={props.handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm w-64 text-xs rounded-xl border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
            )}

            {titleElement?.width < 500 && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-xl text-[18px] text-green-700 hover:bg-green-100 w-9 h-9 transition-all"
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </button>
            )}

            {props.openColumnModal && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-xl text-[18px] text-green-700 hover:bg-green-100 w-9 h-9 transition-all"
                aria-label="Columns"
                onClick={props.openColumnModal}
              >
                <i className="fa-light fa-table-columns"></i>
              </button>
            )}
          </div>
        </div>

        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <div className="top-full left-0 w-full px-1 md:px-2 pt-1 pb-3">
            <input
              type="search"
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              className="op-input op-input-bordered op-input-sm w-full text-xs rounded-xl border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>
        )}

        <div
          className={`overflow-auto w-full rounded-2xl border border-green-100 bg-white shadow-sm ${
            props.List?.length > 0
              ? isDashboard
                ? "min-h-[317px]"
                : currentList?.length === props.docPerPage
                  ? "h-fit"
                  : "h-screen"
              : ""
          }`}
        >
          <table className="w-full text-sm rounded-xl overflow-hidden">
            <thead className="text-[13px] text-left bg-green-100 text-green-800 uppercase tracking-wide">
              <tr className="border-b border-green-200">
                {props.heading?.map((item, i) => (
                  <th key={i} className="px-3 py-3 font-semibold">
                    {props.columnLabels?.[item] ||
                      t(`report-heading.${item}`, { defaultValue: item })}
                  </th>
                ))}
                {props.actions?.length > 0 && (
                  <th className="px-3 py-3 font-semibold text-green-800">
                    {t("action")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="text-[12px] text-slate-700">
              {props.List?.length > 0 &&
                !props.searchLoader &&
                currentList.map((item, index) => (
                  <tr
                    className="border-b border-gray-100 hover:bg-green-50 transition-all duration-200"
                    key={index}
                  >
                    {props?.heading?.map((col) => (
                      <RenderReportCell
                        key={col}
                        col={col}
                        rowData={item}
                        rowIndex={index}
                        startIndex={startIndex}
                        handleDownload={handleDownload}
                        handleRemovePrefill={handleRemovePrefill}
                        reportName={props.ReportName}
                        handleItemClick={handleItemClick}
                      />
                    ))}

                    <td className="px-3 py-3 align-middle">
                      <div className="text-base-content min-w-max flex flex-row flex-wrap gap-x-2 gap-y-2 justify-start items-center">
                        {props.actions?.length > 0 &&
                          props.actions.map((act, index) => (
                            <React.Fragment key={index}>
                              {handleBtnVisibility(act, item) && (
                                <div
                                  data-dropdown-root="1"
                                  role="button"
                                  data-tut={act?.selector}
                                  onClick={() => handleActionBtn(act, item)}
                                  title={t(`btnLabel.${act.hoverLabel}`)}
                                  className={
                                    act.action !== "option"
                                      ? `${act?.btnColor || ""} op-btn op-btn-sm rounded-xl mr-1 shadow-sm`
                                      : "text-green-700 hover:text-green-900 focus:outline-none text-lg mr-2 relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100"
                                  }
                                >
                                  <i className={act.btnIcon}></i>
                                  {act.btnLabel && (
                                    <span className="uppercase font-medium">
                                      {t(`btnLabel.${act.btnLabel}`)}
                                    </span>
                                  )}

                                  {isOption[item.objectId] &&
                                    act.action === "option" && (
                                      <ul className="absolute -right-1 top-auto z-[70] w-max op-dropdown-content op-menu op-menu-sm shadow-lg bg-white border border-green-100 text-slate-700 rounded-2xl">
                                        {act.subaction?.map(
                                          (subact) =>
                                            !restrictBtn(item, subact) && (
                                              <li
                                                key={subact.btnId}
                                                onClick={() =>
                                                  handleActionBtn(subact, item)
                                                }
                                                title={t(
                                                  `btnLabel.${subact.hoverLabel}`
                                                )}
                                              >
                                                <span className="hover:bg-green-50 rounded-xl">
                                                  <i
                                                    className={`${subact.btnIcon} mr-1.5 text-green-700`}
                                                  ></i>
                                                  {subact.btnLabel && (
                                                    <span className="text-[13px] capitalize font-medium">
                                                      {t(
                                                        `btnLabel.${subact.btnLabel}`
                                                      )}
                                                    </span>
                                                  )}
                                                </span>
                                              </li>
                                            )
                                        )}
                                      </ul>
                                    )}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                      </div>

                      {isModal["recreatedocument_" + item.objectId] && (
                        <ModalUi isOpen handleClose={handleCloseModal}>
                          {actLoader[item.objectId] && (
                            <div className="absolute h-full w-full flex justify-center items-center rounded-box bg-black/30">
                              <Loader />
                            </div>
                          )}
                          <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
                            {t("fix-&-resend-document")}
                          </h3>
                          {error ? (
                            <div className="p-[15px] md:p-[20px]">{error}</div>
                          ) : (
                            <div className="p-[15px] md:p-[20px]">
                              <div className="text-lg font-normal text-center">
                                <img
                                  src={recreatedoc}
                                  alt="recreate-doc"
                                  className="mx-auto w-[200px] h-auto"
                                />
                                <p className="text-sm md:text-base md:px-2 mt-2">
                                  {t("do-you-want-recreate-document?")}
                                </p>
                              </div>
                              <hr className="bg-[#ccc] mt-2.5" />
                              <div className="flex items-center justify-center mt-[14px] md:mt-[16px] gap-2 text-white">
                                <button
                                  onClick={() => handleRecreateDoc(item)}
                                  className="op-btn op-btn-primary focus:outline-none text-sm relative px-4 rounded-xl"
                                >
                                  {t("start-editing")}
                                </button>
                                <button
                                  onClick={handleCloseModal}
                                  className="op-btn op-btn-secondary focus:outline-none text-sm relative px-8 rounded-xl"
                                >
                                  {t("cancel")}
                                </button>
                              </div>
                            </div>
                          )}
                        </ModalUi>
                      )}

                      {isModal["saveastemplate_" + item.objectId] && (
                        <ModalUi
                          isOpen
                          title={
                            isSuccess[item.objectId]
                              ? t("template-created")
                              : t("btnLabel.Save as template")
                          }
                          handleClose={handleCloseTemplate}
                        >
                          {isSuccess[item.objectId] ? (
                            <div className="mx-[10px] my-[15px]">
                              <p className="text-base text-center">
                                {t("how-would-you-like-to-proceed?")}
                              </p>
                              <div className="flex flex-wrap gap-1 items-center justify-center mt-2">
                                <button
                                  className="op-btn-primary op-btn op-btn-sm focus:outline-none text-sm relative rounded-xl"
                                  onClick={() =>
                                    handleUseTemplate(templateId, item)
                                  }
                                >
                                  <i className="fa-light fa-plus"></i>{" "}
                                  {t("btnLabel.Use")}
                                </button>
                                <button
                                  className="op-btn-secondary op-btn op-btn-sm focus:outline-none text-sm relative rounded-xl"
                                  onClick={() =>
                                    handleBulkSendTemplate(
                                      templateId,
                                      item.objectId
                                    )
                                  }
                                >
                                  <i className="fa-light fa-plus"></i>{" "}
                                  {`${t(`btnLabel.Quick send`)}`}
                                </button>
                                <button
                                  className="op-btn-secondary op-btn op-btn-sm focus:outline-none text-sm relative rounded-xl"
                                  onClick={() =>
                                    navigate(`/template/${templateId}`)
                                  }
                                >
                                  <i className="fa-light fa-pen"></i>{" "}
                                  {t(`btnLabel.Edit`)}
                                </button>
                              </div>
                              <Link
                                to="/report/6TeaPr321t"
                                className="cursor-pointer underline text-sm w-full flex justify-center mt-2 text-green-700"
                              >
                                {t("go-to-manage-templates")}
                              </Link>
                            </div>
                          ) : (
                            <div className="m-[20px]">
                              {error ? (
                                <>{error}</>
                              ) : (
                                <>
                                  <div className="text-lg font-normal text-base-content">
                                    {t("save-as-template-?")}
                                    {handleWarning(item)}
                                  </div>
                                  <hr className="bg-[#ccc] mt-3" />
                                  <div className="flex items-center mt-3 gap-2 text-white">
                                    <button
                                      onClick={() => handleSaveAsTemplate(item)}
                                      className="op-btn op-btn-primary w-[100px] rounded-xl"
                                    >
                                      {t("yes")}
                                    </button>
                                    <button
                                      onClick={handleCloseTemplate}
                                      className="op-btn op-btn-secondary w-[100px] rounded-xl"
                                    >
                                      {t("no")}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </ModalUi>
                      )}

                      {isPrefillModal[item.objectId] && (
                        <PrefillWidgetModal
                          isPrefillModal={isPrefillModal[item.objectId]}
                          prefillData={xyPosition.find(
                            (x) => x.Role === "prefill"
                          )}
                          forms={forms}
                          setForms={setForms}
                          xyPosition={xyPosition}
                          setXyPosition={setXyPosition}
                          handleCreateDocument={handlePrefillWidgetCreateDoc}
                          handleClosePrefillModal={handleClosePrefillModal}
                          handleAddUser={handleAddUser}
                          navigatePageToDoc={navigatePageToDoc}
                          setIsNewContact={setIsNewContact}
                          isNewContact={isNewContact}
                          docId={item.objectId}
                          isSubmit={isSubmit}
                        />
                      )}

                      {isModal["extendexpiry_" + item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("btnLabel.extend-expiry-date")}
                          reduceWidth={"md:max-w-[450px]"}
                          handleClose={handleCloseModal}
                        >
                          <form
                            className="px-4 py-2 flex flex-col w-full"
                            onSubmit={(e) => handleUpdateExpiry(e, item)}
                          >
                            <div className="text-sm mb-2">
                              <span className="font-medium mr-1">
                                {t("current-expiry-date")}:
                              </span>
                              {item?.ExpiryDate?.iso
                                ? formatDateToDdMmmYyyy(
                                    new Date(item?.ExpiryDate?.iso)
                                  )
                                : t("no-data")}
                            </div>
                            <label className="mr-2">
                              {t("expiry-date")} {"(dd-mm-yyyy)"}
                            </label>
                            <div className="w-full">
                              <DatePicker
                                selectDate={{
                                  date: expiryDate,
                                  format: "dd-MM-yyyy"
                                }}
                                format="dd-MM-yyyy"
                                onChange={(date) => setExpiryDate(date)}
                                handleClear={() => setExpiryDate(null)}
                                showLabel={false}
                                showClear={false}
                                dateClassName="text-sm md:text-base"
                              />
                            </div>
                            <div className="flex justify-start mb-1 mt-3">
                              <button
                                type="submit"
                                className="op-btn op-btn-primary rounded-xl"
                              >
                                {t("update")}
                              </button>
                            </div>
                          </form>
                        </ModalUi>
                      )}

                      {isDeleteModal[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("delete-document")}
                          handleClose={handleClose}
                        >
                          <div className="m-[20px]">
                            <div className="text-lg font-normal text-base-content">
                              {t("delete-document-alert")}
                            </div>
                            <hr className="bg-[#ccc] mt-4" />
                            <div className="flex items-center mt-3 gap-2 text-white">
                              <button
                                onClick={() => handleDelete(item)}
                                className="op-btn op-btn-primary rounded-xl"
                              >
                                {t("yes")}
                              </button>
                              <button
                                onClick={handleClose}
                                className="op-btn op-btn-secondary rounded-xl"
                              >
                                {t("no")}
                              </button>
                            </div>
                          </div>
                        </ModalUi>
                      )}

                      {isBulkSend[item.objectId] && (
                        <ModalUi
                          isOpen
                          showScrollBar
                          title={t("quick-send")}
                          reduceWidth={"md:min-w-[80%]"}
                          isLoader={isBulkLoader}
                          handleClose={() => setIsBulkSend({})}
                        >
                          {isLoader[item.objectId] ? (
                            <div className="w-full h-[100px] flex justify-center items-center z-30">
                              <Loader />
                            </div>
                          ) : (
                            <BulkSendUi
                              Placeholders={placeholders}
                              item={templateDeatils}
                              handleClose={handleQuickSendClose}
                              signatureType={signatureType}
                            />
                          )}
                        </ModalUi>
                      )}

                      {isShare[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("copy-link")}
                          handleClose={() => {
                            setIsShare({});
                            setActLoader({});
                            setCopied(false);
                          }}
                        >
                          <div className="m-[20px]">
                            {shareUrls.map((share, i) => (
                              <div
                                key={i}
                                className="text-sm font-normal text-base-content flex my-2 justify-between items-center"
                              >
                                <span className="w-[150px] mr-[5px] md:mr-0 md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis text-sm font-semibold">
                                  {share.email}
                                </span>
                                <div className="flex items-center gap-2">
                                  <ShareButton
                                    title={t("sign-url")}
                                    text={t("sign-url")}
                                    url={share.url}
                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm rounded-xl"
                                  >
                                    <i className="fa-light fa-share-from-square"></i>
                                    {t("btnLabel.Share")}
                                  </ShareButton>
                                  <button
                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm rounded-xl"
                                    onClick={() =>
                                      copybtn(share.url, share.email)
                                    }
                                  >
                                    <i className="fa-light fa-copy" />
                                    {copied[share.email]
                                      ? t("copied")
                                      : t("copy")}
                                  </button>
                                </div>
                              </div>
                            ))}
                            <p ref={copyUrlRef} className="hidden"></p>
                          </div>
                        </ModalUi>
                      )}

                      {isRevoke[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("revoke-document")}
                          handleClose={handleClose}
                        >
                          <div className="m-[20px]">
                            <div className="text-sm md:text-lg font-normal text-base-content">
                              {t("revoke-document-alert")}
                            </div>
                            <div className="mt-2">
                              <textarea
                                rows={3}
                                placeholder="Reason (optional)"
                                className="px-4 op-textarea op-textarea-bordered text-base-content focus:outline-none hover:border-base-content w-full text-xs rounded-xl"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              ></textarea>
                            </div>
                            <div className="flex items-center mt-3 gap-2">
                              <button
                                onClick={() => handleRevoke(item)}
                                className="op-btn op-btn-primary px-6 rounded-xl"
                              >
                                {t("yes")}
                              </button>
                              <button
                                onClick={handleClose}
                                className="op-btn op-btn-secondary px-6 rounded-xl"
                              >
                                {t("no")}
                              </button>
                            </div>
                          </div>
                        </ModalUi>
                      )}

                      {isResendMail[item.objectId] && (
                        <ModalUi
                          isOpen
                          title={t("resend-mail")}
                          handleClose={handleResendClose}
                        >
                          <div className="overflow-y-auto max-h-[340px] md:max-h-[400px]">
                            {item?.Placeholders?.filter(
                              (user) => user?.Role !== "prefill"
                            )?.map((user) => (
                              <React.Fragment key={user.Id}>
                                {isNextStep[user.Id] && (
                                  <div className="relative">
                                    {actLoader[user.Id] && (
                                      <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                                        <Loader />
                                      </div>
                                    )}
                                    <form
                                      onSubmit={(e) =>
                                        handleResendMail(e, item, user)
                                      }
                                      className="w-full flex flex-col gap-2 p-3 text-base-content relative"
                                    >
                                      <div className="absolute right-5 text-xs z-40">
                                        <Tooltip
                                          id={`${user.Id}_help`}
                                          message={t("resend-mail-help")}
                                        />
                                      </div>
                                      <div>
                                        <label
                                          className="text-xs ml-1"
                                          htmlFor="mailsubject"
                                        >
                                          {t("subject")}{" "}
                                        </label>
                                        <input
                                          id="mailsubject"
                                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs rounded-xl"
                                          value={mail.subject}
                                          onChange={(e) =>
                                            handleSubjectChange(
                                              e.target.value,
                                              item
                                            )
                                          }
                                          onInvalid={(e) =>
                                            e.target.setCustomValidity(
                                              t("input-required")
                                            )
                                          }
                                          onInput={(e) =>
                                            e.target.setCustomValidity("")
                                          }
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label
                                          className="text-xs ml-1"
                                          htmlFor="mailbody"
                                        >
                                          {t("body")}{" "}
                                        </label>
                                        <EmailBodyEditor
                                          value={mail.body || ""}
                                          onChange={(value) =>
                                            handlebodyChange(value, item)
                                          }
                                          smallscreen
                                        />
                                      </div>
                                      <button
                                        type="submit"
                                        className="op-btn op-btn-primary rounded-xl"
                                      >
                                        {t("resend")}
                                      </button>
                                    </form>
                                  </div>
                                )}
                                {Object?.keys(isNextStep) <= 0 && (
                                  <div className="flex justify-between items-center gap-2 my-2 px-3">
                                    <div className="text-base-content">
                                      {user?.signerPtr?.Name || "-"}{" "}
                                      {`<${
                                        user?.email
                                          ? user.email
                                          : user.signerPtr.Email
                                      }>`}
                                    </div>
                                    <>{fetchUserStatus(user, item)}</>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </ModalUi>
                      )}

                      <ModalUi
                        title={t("btnLabel.Rename")}
                        isOpen={isModal["rename_" + item.objectId]}
                        handleClose={handleCloseModal}
                      >
                        <div className="flex flex-col px-4 pb-3 pt-2">
                          <div className="flex flex-col gap-2">
                            <input
                              maxLength={200}
                              autoFocus={true}
                              type="text"
                              defaultValue={renameDoc || item.Name}
                              onChange={(e) => setRenameDoc(e.target.value)}
                              className="op-input op-input-bordered op-input-sm w-full focus:outline-none hover:border-base-content text-[10px] rounded-xl"
                            />
                          </div>
                          <div className="flex flex-row gap-2 pt-3 mt-3 border-t-[1.5px] border-gray-200">
                            <button
                              className="w-[100px] op-btn op-btn-primary op-btn-md rounded-xl"
                              onClick={() => handleRenameDoc(item)}
                            >
                              {t("save")}
                            </button>
                            <button
                              className="w-[100px] op-btn op-btn-secondary op-btn-md rounded-xl"
                              onClick={handleCloseModal}
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </div>
                      </ModalUi>

                      {isDownloadModal[item.objectId] && (
                        <DownloadPdfZip
                          setIsDownloadModal={setIsDownloadModal}
                          isDownloadModal={isDownloadModal[item.objectId]}
                          pdfDetails={[item]}
                          isDocId={false}
                        />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {(props.searchLoader || props.List?.length <= 0) && (
            <div
              className={`${
                isDashboard ? "h-[317px]" : ""
              } flex flex-col items-center justify-center w-full bg-white text-base-content rounded-2xl py-8`}
            >
              {props.searchLoader ? (
                <>
                  <Loader />
                  <div className="text-sm text-green-700 mt-2">
                    {t("loading-mssg")}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-[60px] h-[60px] overflow-hidden">
                    <img
                      className="w-full h-full object-contain"
                      src={pad}
                      alt={t("no-data-available")}
                    />
                  </div>
                  <div className="text-sm font-semibold text-slate-700 mt-2">
                    {t("no-data-available")}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="op-join flex flex-wrap items-center p-2 gap-1 mt-3">
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateBack()}
              className="op-join-item op-btn op-btn-sm rounded-xl border border-green-200 bg-white text-green-800 hover:bg-green-100"
            >
              {t("prev")}
            </button>
          )}

          {pageNumbers.map((x, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(x)}
              disabled={x === "..."}
              className={`${
                x === currentPage
                  ? "bg-[#1D8F6A] text-white border-[#1D8F6A]"
                  : "bg-white text-green-800 border-green-200 hover:bg-green-100"
              } op-join-item op-btn op-btn-sm rounded-xl border`}
            >
              {x}
            </button>
          ))}

          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateFront()}
              className="op-join-item op-btn op-btn-sm rounded-xl border border-green-200 bg-white text-green-800 hover:bg-green-100"
            >
              {t("next")}
            </button>
          )}
        </div>

        <CustomizeMail
          setIsMailModal={setIsMailModal}
          setCustomizeMail={setCustomizeMail}
          documentId={documentId}
          signerList={signerList}
          setIsSend={setIsSend}
          setMailStatus={setMailStatus}
          customizeMail={customizeMail}
          defaultMail={defaultMail}
          isMailModal={isMailModal}
          setCurrUserId={setCurrUserId}
          handleShareList={handleShareList}
          setDocumentDetails={setDocumentDetails}
          handleClose={handleCloseMail}
          copyUrlRef={copyUrlRef}
        />

        <ModalUi
          isOpen={isSend}
          title={
            mailStatus === "success"
              ? t("mails-sent")
              : mailStatus === "quotareached"
                ? t("quota-mail-head")
                : t("mail-not-delivered")
          }
          handleClose={() => {
            setIsSend(false);
            navigate("/report/1MwEuxLEkF");
          }}
        >
          <div className="h-[100%] p-[20px] text-base-content">
            {mailStatus === "success" ? (
              <div className="text-center mb-[10px]">
                <LottieWithLoader />
                {documentDetails?.SendinOrder ? (
                  <p>
                    {currUserId
                      ? t("placeholder-mail-alert-you")
                      : t("placeholder-mail-alert", {
                          name: signerList[0]?.Name
                        })}
                  </p>
                ) : (
                  <p>{t("placeholder-alert-4")}</p>
                )}
                {currUserId && <p>{t("placeholder-alert-5")}</p>}
              </div>
            ) : mailStatus === "quotareached" ? (
              <div className="flex flex-col gap-y-3">
                <div className="my-3">{handleShareList()}</div>
              </div>
            ) : (
              <div className="mb-[10px]">
                {mailStatus === "dailyquotareached" ? (
                  <p>{t("daily-quota-reached")}</p>
                ) : (
                  <p>{t("placeholder-alert-6")}</p>
                )}
                {currUserId && (
                  <p className="mt-1">{t("placeholder-alert-5")}</p>
                )}
              </div>
            )}
            {!mailStatus && (
              <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
            )}
            {mailStatus !== "quotareached" && (
              <div
                className={
                  mailStatus === "success" ? "flex justify-center mt-1" : ""
                }
              >
                {currUserId && (
                  <button
                    onClick={() =>
                      handleRecipientSign(documentDetails?.objectId, currUserId)
                    }
                    type="button"
                    className="op-btn op-btn-primary mr-1 rounded-xl"
                  >
                    {t("yes")}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleRecipientSign(documentDetails?.objectId, currUserId);
                  }}
                  type="button"
                  className="op-btn op-btn-ghost text-base-content rounded-xl"
                >
                  {currUserId ? t("no") : t("close")}
                </button>
              </div>
            )}
          </div>
        </ModalUi>

        <ModalUi
          title={t(`report-heading.${objInfoModal.title}`)}
          isOpen={objInfoModal.title}
          handleClose={() => setObjInfoModal({ title: "", info: "" })}
        >
          <div className="p-[20px]">{objInfoModal.info || "-"}</div>
        </ModalUi>
      </div>
    </div>
  );
};

export default DocumentsReport;
 
