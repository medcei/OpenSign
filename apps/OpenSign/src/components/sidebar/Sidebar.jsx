import { useState, useEffect } from "react";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "../SocialMedia";
import dp from "../../assets/images/dp.png";
import sidebarList, { subSetting } from "../../json/menuJson";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "../../hook/useWindowSize";
import {
  setSelectedMenu,
  toggleSidebar
} from "../../redux/reducers/sidebarReducer";

const Sidebar = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState({});

  const username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("Extand_Class")
    ? JSON.parse(localStorage.getItem("Extand_Class"))?.[0]?.Company
    : "";

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const closeSidebar = () => {
    dispatch(setSelectedMenu(true));
    if (width <= 1023) {
      dispatch(toggleSidebar(false));
    }
  };

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        const userRole = extClass?.[0]?.UserRole || "contracts_User";
        const isAdmin =
          userRole === "contracts_Admin" || userRole === "contracts_OrgAdmin";

        const newSidebarList = sidebarList.map((item) => {
          if (item.title !== "Settings") return item;

          const newItem = { ...item };
          const baseChildren = isAdmin
            ? subSetting
            : subSetting?.slice(0, 1);

          const mysignature = newItem.children.slice(0, 1);
          newItem.children = [...mysignature, ...baseChildren];

          return newItem;
        });

        setmenuList(newSidebarList);
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    dispatch(setSelectedMenu(false));
    setSubmenuOpen({ [title]: !submenuOpen[title] });
  };

  const handleMenuItem = () => {
    dispatch(setSelectedMenu(true));
    closeSidebar();
    setSubmenuOpen({});
  };

  const handleProfile = () => {
    closeSidebar();
    navigate("/profile");
  };

  return (
    <aside
      className={`absolute max-lg:min-h-screen lg:relative bg-[#166B50] text-white overflow-y-auto transition-all z-[500] shadow-lg hide-scrollbar border-r border-[#0F4F3C]
      ${isOpen ? "w-full md:w-64" : "w-0"}`}
    >
      <div className="flex px-3 py-4 gap-3 items-center border-b border-[#0F4F3C] bg-[#1D8F6A]">
        <div
          onClick={handleProfile}
          className="w-[65px] h-[65px] rounded-full ring-[2px] ring-offset-2 ring-white/40 overflow-hidden cursor-pointer"
        >
          <img
            className="w-full h-full object-contain bg-white"
            src={image}
            alt="Profile"
          />
        </div>

        <div>
          <p
            onClick={handleProfile}
            className="text-[14px] font-semibold text-white cursor-pointer"
          >
            {username}
          </p>

          <p
            onClick={handleProfile}
            className={`cursor-pointer text-[12px] text-[#DDF3EC] ${
              tenantname ? "mt-1" : ""
            }`}
          >
            {tenantname}
          </p>
        </div>
      </div>

      <nav className="op-menu op-menu-sm mt-2" aria-label="Medcei Sidebar Navigation">
        <ul className="text-sm" role="menubar">
          {menuList.map((item) =>
            !item.children ? (
              <Menu
                key={item.title}
                item={item}
                isOpen={isOpen}
                closeSidebar={handleMenuItem}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
                toggleSubmenu={toggleSubmenu}
                submenuOpen={submenuOpen}
              />
            )
          )}
        </ul>
      </nav>

      <footer className="my-4 flex justify-center items-center text-[22px] text-[#DDF3EC] gap-4">
        <SocialMedia />
      </footer>
    </aside>
  );
};

export default Sidebar;
