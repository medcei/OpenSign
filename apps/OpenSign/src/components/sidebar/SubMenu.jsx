import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Submenu = ({ item, closeSidebar, toggleSubmenu, submenuOpen }) => {
  const { t } = useTranslation();
  const { title, icon, children } = item;
  const { selectedMenu } = useSelector((state) => state.sidebar);

  return (
    <li role="none" className="my-1">
      <button
        onClick={() => toggleSubmenu(item.title)}
        className="flex gap-x-4 items-center justify-start text-left p-3 rounded-md w-full text-white hover:bg-[#1D8F6A] focus:bg-[#1D8F6A] hover:no-underline focus:outline-none transition-all duration-200"
        aria-expanded={submenuOpen[item.title]}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
      >
        <span className="w-[20px] h-[20px] flex justify-center">
          <i className={`${icon} text-[18px]`} aria-hidden="true"></i>
        </span>

        <div className="flex justify-between items-center w-full">
          <span className="flex items-center">
            {t(`sidebar.${item.title}`)}
          </span>

          <i
            className={`${
              submenuOpen[item.title]
                ? "fa-light fa-angle-down"
                : "fa-light fa-angle-right"
            }`}
            aria-hidden="true"
          ></i>
        </div>
      </button>

      {submenuOpen[item.title] && (
        <ul
          id={`submenu-${title}`}
          role="menu"
          aria-label={`${title} submenu`}
          className="mt-1 ml-2"
        >
          {children.map((childItem) => (
            <li key={childItem.title} role="none" className="my-1">
              <NavLink
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                className={({ isActive }) =>
                  `
                  pl-4 flex items-center gap-x-4 py-2 pr-3 text-sm rounded-md transition-all duration-200
                  ${
                    isActive && selectedMenu
                      ? "bg-[#1D8F6A] text-white shadow"
                      : "text-[#DDF3EC]"
                  }
                  hover:bg-[#1D8F6A]
                  hover:text-white
                  focus:bg-[#1D8F6A]
                  focus:outline-none
                `
                }
                onClick={() => closeSidebar(childItem.title)}
                role="menuitem"
                tabIndex={submenuOpen[item.title] ? 0 : -1}
              >
                <span className="w-[18px] h-[18px] flex justify-center">
                  <i
                    className={`${childItem.icon} text-[16px]`}
                    aria-hidden="true"
                  ></i>
                </span>

                <span>
                  {t(`sidebar.${item.title}-Children.${childItem.title}`)}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Submenu;
