import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PRODUCT_SECTION_ROLES = {
  list: ['admin', 'manager', 'staff', 'viewer'],
  create: ['admin', 'manager', 'staff'],
};

const PRODUCT_SECTIONS = [
  { key: 'list', label: 'Product List', href: '/products' },
];

const ProductSectionNav = () => {
  const { user } = useAuth();

  const visibleSections = useMemo(
    () =>
      PRODUCT_SECTIONS.filter((item) =>
        (PRODUCT_SECTION_ROLES[item.key] || PRODUCT_SECTION_ROLES.list).includes(user?.role)
      ),
    [user?.role]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {visibleSections.map((item) => (
        <NavLink
          key={item.key}
          to={item.href}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export { PRODUCT_SECTION_ROLES };
export default ProductSectionNav;
