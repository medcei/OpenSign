import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Menu = ({ item, isOpen, closeSidebar }) => {
  const { t } = useTranslation();
  const { selectedMenu } = useSelector((state) => state.sidebar);

  return (
    <li key={item.title} role="none" className="my-1">
      <NavLink
        to={
          item.pageType
            ? `/${item.pageType}/${item.objectId}`
            : `/${item.objectId}`
        }
        className={({ isActive }) =>
          `
          flex gap-x-4 items-center justify-start text-left p-3 rounded-md transition-all duration-200
          
          ${
            isActive && selectedMenu
              ? "bg-[#1D8F6A] text-white shadow"
              : "text-white"
          }

          hover:bg-[#1D8F6A]
          hover:text-white
          focus:bg-[#1D8F6A]
          focus:outline-none
        `
        }
        onClick={() => closeSidebar(item.title)}
        tabIndex={isOpen ? 0 : -1}
        role="menuitem"
      >
        {/* Ícone */}
        <span className="w-[20px] h-[20px] flex justify-center">
          <i className={`${item.icon} text-[18px]`} aria-hidden="true"></i>
        </span>

        {/* Texto */}
        <span className="flex items-center">
          {t(`sidebar.${item.title}`)}
        </span>
      </NavLink>
    </li>
  );
};

export default Menu;
