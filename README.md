# Smart Inventory and Asset Management System

A comprehensive, intelligent inventory and asset management system built with modern web technologies.

## 🚀 Features

### Core Functionality
- **Inventory Management**: Track products, stock levels, categories, and suppliers
- **Asset Management**: Manage company assets with depreciation tracking and maintenance schedules
- **Transaction Management**: Handle purchases, sales, adjustments, and transfers
- **Supplier Management**: Maintain supplier relationships and performance tracking
- **User Management**: Role-based access control with granular permissions
- **Alert System**: Real-time notifications for low stock, maintenance due, and more

### Smart Features
- **AI-Powered Demand Prediction**: Forecast future inventory needs using machine learning
- **Auto-Restock Suggestions**: Intelligent recommendations based on historical data
- **Expense Insights**: Analyze spending patterns and identify cost-saving opportunities
- **Fraud Detection**: Monitor transactions for suspicious activities
- **Real-Time Updates**: Live notifications via Socket.IO

### Analytics & Reporting
- **Dashboard Overview**: Key metrics and KPIs at a glance
- **Interactive Charts**: Visualize trends using Recharts
- **Performance Analytics**: Supplier performance and asset utilization
- **Transaction Analysis**: Revenue tracking and payment status monitoring

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **React Query** - Server state management
- **Axios** - HTTP client
- **Heroicons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time communication
- **JWT** - Secure authentication
- **Mongoose** - MongoDB object modeling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/piy-jpg/smart_inventory_systemm.git
cd smart-inventory-assets-sys
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Environment Configuration

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_inventory
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Running the Application

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage

### Default Login Credentials
- **Email**: admin@example.com
- **Password**: password123

### Key Features Access

1. **Dashboard**: Overview of all metrics and analytics
2. **Inventory**: Manage products and stock levels
3. **Assets**: Track company assets and maintenance
4. **Transactions**: Record purchases and sales
5. **Suppliers**: Manage vendor relationships
6. **Analytics**: Deep insights into operations
7. **AI Insights**: Leverage machine learning predictions
8. **Alerts**: Monitor system notifications
9. **Users**: Manage team access and permissions
10. **Settings**: Configure system preferences

## 🏗️ Project Structure

```
smart-inventory-assets-sys/
├── backend/
│   ├── config/          # Database and auth configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   ├── App.js       # Main application component
│   │   └── index.js     # Application entry point
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/:id` - Get inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `POST /api/inventory/:id/adjust-stock` - Adjust stock levels

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/:id/assign` - Assign asset to user
- `POST /api/assets/:id/maintenance` - Add maintenance record

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/:id/approve` - Approve transaction
- `POST /api/transactions/:id/cancel` - Cancel transaction

### AI Features
- `POST /api/ai/predict-demand` - Predict demand for inventory item
- `POST /api/ai/auto-restock-suggestions` - Get restock recommendations
- `POST /api/ai/expense-insights` - Analyze expenses
- `POST /api/ai/fraud-detection` - Detect fraudulent activities

## 🎨 Customization

### Adding New Fields to Models
1. Update the corresponding Mongoose schema in `backend/models/`
2. Modify the frontend form components
3. Update API validation in `backend/middleware/validation.js`

### Customizing UI Theme
1. Edit `frontend/src/index.css` for global styles
2. Modify `frontend/tailwind.config.js` for Tailwind customization
3. Update color schemes in component files

## 🚀 Deployment

### Backend (Render/Railway)
1. Set environment variables
2. Deploy to your preferred platform
3. Ensure MongoDB is accessible

### Frontend (Vercel)
1. Set `REACT_APP_API_URL` environment variable in Vercel dashboard
2. Deploy to Vercel using GitHub integration
3. Configure custom domain if needed

#### Vercel Deployment Steps:
1. Push code to GitHub repository
2. Connect GitHub account to Vercel
3. Import the `smart_inventory_systemm` repository
4. Configure environment variables:
   - `REACT_APP_API_URL`: Your backend API URL
5. Deploy automatically

#### Environment Variables for Vercel:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Update connection string in environment
3. Set up proper indexes for performance

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers

## 📊 Performance Optimization

- Database indexing for fast queries
- React Query caching for API responses
- Lazy loading of components
- Pagination for large datasets
- Image optimization and compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Include steps to reproduce any bugs

## 🔄 Updates

The system is regularly updated with new features and improvements. Check the changelog for version history and update notes.
