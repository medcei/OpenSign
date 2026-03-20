import React from "react";
import { useNavigate } from "react-router";
import { openInNewTab } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const DashboardButton = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;

      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        openInNewTab(id);
      }
    }
  }

  const isClickable = props.Data && props.Data.Redirect_type;

  return (
    <div
      onClick={() => openReport()}
      className={`${
        isClickable
          ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          : "cursor-default"
      } w-full px-5 py-4 bg-white rounded-2xl shadow-sm border border-gray-200`}
    >
      <div className="flex flex-row items-center text-[#1F2937]">
        <div className="flex flex-row items-center">
          <span className="rounded-full bg-[#DDF3EC] w-[64px] h-[64px] self-start flex justify-center items-center border border-[#B7E4D7]">
            <i
              className={`${
                props.Icon ? props.Icon : "fa-light fa-info"
              } text-[26px] lg:text-[30px] text-[#166B50]`}
            ></i>
          </span>
        </div>

        <div className="ml-4">
          <div className="text-[16px] md:text-[18px] font-semibold text-[#1F2937] leading-tight">
            {t(`sidebar.${props.Label}`)}
          </div>

          {props.Label === "Sign yourself" && (
            <div className="text-[#6B7280] text-[12px] md:text-[13px] mt-1 leading-relaxed">
              {t("signyour-self-button")}
            </div>
          )}

          {props.Label === "Request signatures" && (
            <div className="text-[#6B7280] text-[12px] md:text-[13px] mt-1 leading-relaxed">
              {t("requestsign-button")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardButton;
