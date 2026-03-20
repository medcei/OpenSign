import { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import medceiLogo from "../assets/images/logo-medcei.png";
import FullScreenButton from "./FullScreenButton";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import { saveLanguageInLocal } from "../constant/Utils";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/reducers/sidebarReducer";
import { sessionStatus } from "../redux/reducers/userReducer";

const Header = ({ isConsole, setIsLoggingOut }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const dispatch = useDispatch();

  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    closeSidebar();
  };

  const closeSidebar = () => {
    if (width && width <= 768) {
      dispatch(toggleSidebar(false));
    }
  };

  useEffect(() => {
    closeSidebar();
  }, [width]);

  const showSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = async () => {
    setIsOpen(false);
    setIsLoggingOut(true);

    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    } finally {
      dispatch(sessionStatus(true));
    }

    const appdata = localStorage.getItem("userSettings");
    const defaultmenuid = localStorage.getItem("defaultmenuid");
    const PageLanding = localStorage.getItem("PageLanding");
    const baseUrl = localStorage.getItem("baseUrl");
    const appid = localStorage.getItem("parseAppId");
    const favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("defaultmenuid", defaultmenuid || "");
    localStorage.setItem("PageLanding", PageLanding || "");
    localStorage.setItem("userSettings", appdata || "");
    localStorage.setItem("baseUrl", baseUrl || "");
    localStorage.setItem("parseAppId", appid || "");
    localStorage.setItem("favicon", favicon || "");

    setIsLoggingOut(false);
    navigate("/");
  };

  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="op-navbar shadow touch-none bg-[#1E3A8A] text-white">
      <div className="flex-none">
        <button
          className="op-btn op-btn-square op-btn-ghost focus:outline-none hover:bg-transparent op-btn-sm no-animation"
          onClick={showSidebar}
        >
          <i className="fa-light fa-bars text-xl text-white"></i>
        </button>
      </div>

      <div className="flex-1 ml-2">
        <div
          onClick={() => navigate("/dashboard/35KBoSgoAK")}
          className="flex items-center gap-2 h-[35px] md:h-[45px] cursor-pointer"
        >
          <img
            className="object-contain h-full w-auto"
            src={medceiLogo}
            alt="Medcei logo"
          />
          <span className="font-semibold text-lg text-white hidden md:block">
            Medcei Sign
          </span>
        </div>
      </div>

      <div id="profile-menu" className="flex-none gap-2">
        <div className="text-white">
          <FullScreenButton />
        </div>

        {width >= 768 && (
          <div
            onClick={toggleDropdown}
            className="cursor-pointer w-[35px] h-[35px] rounded-full ring-[1px] ring-offset-2 ring-gray-300 overflow-hidden"
          >
            <img
              className="w-[35px] h-[35px] object-contain"
              src={image}
              alt="Profile"
            />
          </div>
        )}

        {width >= 768 && (
          <div
            onClick={toggleDropdown}
            role="button"
            tabIndex={0}
            className="cursor-pointer text-white text-sm"
          >
            {username}
          </div>
        )}

        <div
          className="op-dropdown op-dropdown-open op-dropdown-end"
          id="profile-menu"
        >
          <div
            tabIndex={0}
            role="button"
            onClick={toggleDropdown}
            className="op-btn op-btn-ghost op-btn-xs w-[10px] h-[20px] hover:bg-transparent"
          >
            <i className="fa-light fa-angle-down text-white"></i>
          </div>

          <ul
            tabIndex={0}
            className={`mt-4 z-[1] p-2 shadow op-dropdown-open op-menu op-menu-sm op-dropdown-content text-white bg-[#0F172A] rounded-box w-56 ${
              isOpen ? "" : "hidden"
            }`}
          >
            {!isConsole && (
              <>
                <li
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/profile");
                  }}
                >
                  <span>
                    <i className="fa-light fa-user"></i> {t("profile")}
                  </span>
                </li>

                <li
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/changepassword");
                  }}
                >
                  <span>
                    <i className="fa-light fa-lock"></i>{" "}
                    {t("change-password")}
                  </span>
                </li>

                <li
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/verify-document");
                  }}
                >
                  <span>
                    <i className="fa-light fa-check-square"></i>{" "}
                    {t("verify-document")}
                  </span>
                </li>

                <li>
                  <span className="flex items-center gap-2">
                    <i className="fa-light fa-moon"></i>
                    {t("dark-mode")}
                    <span className="text-[10px] font-semibold bg-slate-600 text-white px-1 rounded-md">
                      BETA
                    </span>
                    <ThemeToggle />
                  </span>
                </li>
              </>
            )}

            <li onClick={handleLogout}>
              <span>
                <i className="fa-light fa-arrow-right-from-bracket"></i>{" "}
                {t("log-out")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
