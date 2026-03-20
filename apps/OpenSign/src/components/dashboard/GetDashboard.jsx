import { Suspense } from "react";
import { lazyWithRetry } from "../../utils";
import { useTranslation } from "react-i18next";

const DashboardButton = lazyWithRetry(() => import("./DashboardButton"));
const DashboardCard = lazyWithRetry(() => import("./DashboardCard"));
const DashboardReport = lazyWithRetry(() => import("./DashboardReport"));

const buttonList = [
  {
    label: "Sign yourself",
    redirectId: "sHAnZphf69",
    redirectType: "Form",
    icon: "fa-light fa-pen-nib"
  },
  {
    label: "Request signatures",
    redirectId: "8mZzFxbG1z",
    redirectType: "Form",
    icon: "fa-light fa-paper-plane"
  }
];

const GetDashboard = (props) => {
  const { t } = useTranslation();

  const Button = ({ label, redirectId, redirectType, icon }) => (
    <DashboardButton
      Icon={icon}
      Label={label}
      Data={{ Redirect_type: redirectType, Redirect_id: redirectId }}
    />
  );

  const cardBaseClass =
    "relative overflow-hidden op-card w-full min-h-[150px] px-4 pt-4 pb-4 mb-4 rounded-2xl shadow-lg border border-white/10 text-white";

  const cardOverlay =
    "before:absolute before:top-0 before:right-0 before:w-40 before:h-20 before:bg-white/10 before:rounded-full before:blur-2xl before:content-['']";

  const getCardBgClass = (col) =>
    col?.widget?.bgColor
      ? col.widget.bgColor
      : "bg-gradient-to-br from-[#1D8F6A] via-[#198A67] to-[#166B50]";

  const loadingCard = (
    <div className="h-[150px] w-full flex justify-center items-center text-white text-sm">
      {t("loading")}
    </div>
  );

  const loadingReport = (
    <div className="h-[220px] w-full flex justify-center items-center rounded-2xl bg-white shadow-sm border border-gray-100 text-[#166B50]">
      {t("loading")}
    </div>
  );

  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={`${getCardBgClass(col)} ${cardBaseClass} ${cardOverlay}`}
            data-tut={col.widget.data.tourSection}
          >
            <Suspense fallback={loadingCard}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
              />
            </Suspense>
          </div>
        );

      case "report":
        return (
          <div data-tut={col.widget.data.tourSection}>
            <Suspense fallback={loadingReport}>
              <div className="mb-4">
                <DashboardReport Record={col.widget} />
              </div>
            </Suspense>
          </div>
        );

      default:
        return <></>;
    }
  };

  const renderSwitch = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={`${getCardBgClass(col)} ${cardBaseClass} ${cardOverlay}`}
          >
            <Suspense fallback={loadingCard}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
              />
            </Suspense>
          </div>
        );

      case "report":
        return (
          <Suspense fallback={loadingReport}>
            <div className="mb-4">
              <DashboardReport Record={col.widget} />
            </div>
          </Suspense>
        );

      default:
        return <></>;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <div
          data-tut="tourbutton"
          className="flex flex-col md:flex-row gap-4"
        >
          {buttonList.map((btn) => (
            <Button
              key={btn.label}
              label={btn.label}
              redirectType={btn.redirectType}
              redirectId={btn.redirectId}
              icon={btn.icon}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 w-full gap-4">
        {props?.dashboard?.columns?.map((col, i) =>
          col.widget.data && col.widget.data.tourSection ? (
            <div key={i} className={col?.colsize}>
              {renderSwitchWithTour(col)}
            </div>
          ) : (
            <div key={i} className={col?.colsize}>
              {renderSwitch(col)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GetDashboard;
