import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PrinterIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const AddPurchase = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const canCreatePurchases = ['admin', 'manager', 'staff'].includes(user?.role);

  // Mock products data
  const [products] = useState([
    { id: 1, name: 'Laptop Pro 15"', sku: 'LP-001', price: 1299.99, stock: 25, category: 'Electronics' },
    { id: 2, name: 'Wireless Mouse', sku: 'WM-002', price: 29.99, stock: 150, category: 'Electronics' },
    { id: 3, name: 'USB-C Cable', sku: 'UC-003', price: 15.99, stock: 200, category: 'Electronics' },
    { id: 4, name: 'Office Chair', sku: 'OC-004', price: 299.99, stock: 15, category: 'Furniture' },
    { id: 5, name: 'Desk Lamp', sku: 'DL-005', price: 49.99, stock: 30, category: 'Furniture' },
    { id: 6, name: 'Notebook Set', sku: 'NS-006', price: 12.99, stock: 100, category: 'Stationery' },
    { id: 7, name: 'Pen Pack', sku: 'PP-007', price: 8.99, stock: 200, category: 'Stationery' },
    { id: 8, name: 'Keyboard', sku: 'KB-008', price: 79.99, stock: 45, category: 'Electronics' }
  ]);

  // Mock suppliers data
  const [suppliers] = useState([
    { id: 1, name: 'Tech Supplies Inc', email: 'orders@techsupplies.com', phone: '+1234567890' },
    { id: 2, name: 'Office Depot Wholesale', email: 'wholesale@officedepot.com', phone: '+1234567891' },
    { id: 3, name: 'Global Furniture Co', email: 'orders@globalfurniture.com', phone: '+1234567892' },
    { id: 4, name: 'Stationery Plus', email: 'orders@stationeryplus.com', phone: '+1234567893' }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount;
  };

  const processPurchase = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    if (!expectedDate) {
      toast.error('Please select expected delivery date');
      return;
    }

    const purchaseData = {
      id: `PO-${Date.now()}`,
      orderNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      supplierName: selectedSupplier.name,
      supplierEmail: selectedSupplier.email,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate,
      amount: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status: 'pending',
      items: cart.length,
      createdBy: 'Current User',
      paymentMethod: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer',
      notes: notes,
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    };

    // Save to localStorage for persistence
    try {
      const existingPurchases = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
      existingPurchases.push(purchaseData);
      localStorage.setItem('purchaseOrders', JSON.stringify(existingPurchases));

      console.log('Purchase processed successfully:', purchaseData);
      toast.success(`Purchase order created successfully! ${purchaseData.orderNumber}`);
      
      setTimeout(() => {
        toast.success(`Total: $${purchaseData.total.toFixed(2)} - ${purchaseData.items} items`);
      }, 1000);
      
      // Reset cart and form
      setCart([]);
      setSelectedSupplier(null);
      setDiscount(0);
      setNotes('');
      setPaymentMethod('cash');
      setExpectedDate('');
      
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Error processing purchase. Please try again.');
    }
  };

  return (
    <div className="page-stack">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Add Purchase</h1>
            <p className="page-subtitle">Create new purchase order</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn btn-secondary flex items-center space-x-2">
              <PrinterIcon className="h-4 w-4" />
              <span>Print Order</span>
            </button>
            {canCreatePurchases && (
              <button
                onClick={processPurchase}
                className="btn btn-primary flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Create Order</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Products and Supplier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Supplier</h3>
              <button
                onClick={() => setShowSupplierModal(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <BuildingOfficeIcon className="h-4 w-4" />
                <span>Select Supplier</span>
              </button>
            </div>
            
            {selectedSupplier ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedSupplier.name}</p>
                    <p className="text-sm text-gray-500">{selectedSupplier.email}</p>
                    <p className="text-sm text-gray-500">{selectedSupplier.phone}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No supplier selected</p>
                <p className="text-sm">Select a supplier to continue</p>
              </div>
            )}
          </motion.div>

          {/* Product Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <button
                onClick={() => setShowProductModal(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <CubeIcon className="h-4 w-4" />
                <span>Browse Products</span>
              </button>
            </div>
            
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      <button className="text-blue-600 hover:text-blue-900">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="font-medium">${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-gray-900">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-lg border ${
                    paymentMethod === 'cash' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <BanknotesIcon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-lg border ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Card</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Add notes..."
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Supplier Selection Modal */}
      {showSupplierModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSupplierModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Supplier</h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {suppliers.map(supplier => (
                <div
                  key={supplier.id}
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setShowSupplierModal(false);
                  }}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-sm text-gray-500">{supplier.email}</p>
                  <p className="text-sm text-gray-500">{supplier.phone}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Product Browse Modal */}
      {showProductModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowProductModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Browse Products</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    addToCart(product);
                    setShowProductModal(false);
                  }}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${product.price.toFixed(2)}</p>
                      <button className="text-blue-600 hover:text-blue-900">
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AddPurchase;
