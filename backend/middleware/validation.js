const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateUser = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be admin, manager, or employee'),
  handleValidationErrors
];

const validateInventory = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('price.cost')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('price.selling')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  body('supplier_id')
    .isMongoId()
    .withMessage('Valid supplier ID is required'),
  body('minStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock level must be a non-negative integer'),
  body('maxStockLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stock level must be a non-negative integer'),
  handleValidationErrors
];

const validateAsset = [
  body('asset_name')
    .notEmpty()
    .withMessage('Asset name is required')
    .isLength({ max: 100 })
    .withMessage('Asset name cannot exceed 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('type')
    .isIn(['equipment', 'furniture', 'vehicle', 'electronics', 'machinery', 'building', 'other'])
    .withMessage('Invalid asset type'),
  body('purchase_date')
    .isISO8601()
    .withMessage('Invalid purchase date format'),
  body('purchase_cost.amount')
    .isFloat({ min: 0 })
    .withMessage('Purchase cost must be a positive number'),
  body('depreciation.usefulLife')
    .isInt({ min: 1 })
    .withMessage('Useful life must be at least 1 year'),
  handleValidationErrors
];

const validateTransaction = [
  body('type')
    .isIn(['purchase', 'sale', 'adjustment', 'transfer', 'return', 'disposal', 'maintenance'])
    .withMessage('Invalid transaction type'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.inventory_item')
    .isMongoId()
    .withMessage('Valid inventory item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be a positive integer'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('amount.total')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  handleValidationErrors
];

const validateSupplier = [
  body('name')
    .notEmpty()
    .withMessage('Supplier name is required')
    .isLength({ max: 100 })
    .withMessage('Supplier name cannot exceed 100 characters'),
  body('company_name')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('contact_person.name')
    .notEmpty()
    .withMessage('Contact person name is required'),
  body('contact_person.email')
    .isEmail()
    .withMessage('Valid contact email is required')
    .normalizeEmail(),
  body('contact_person.phone')
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .optional()
    .trim()
    .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
  body('identifier')
    .optional()
    .trim()
    .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
  body()
    .custom((value) => {
      const identifier = value.identifier || value.email;
      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        throw new Error('Email or username is required');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateInventory,
  validateAsset,
  validateTransaction,
  validateSupplier,
  validateLogin,
  handleValidationErrors
};
