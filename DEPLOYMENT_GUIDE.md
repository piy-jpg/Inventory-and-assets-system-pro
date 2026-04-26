# Smart Inventory System - Vercel Deployment Guide

## Overview
This guide will help you deploy the Smart Inventory System to Vercel with both frontend and backend components.

## Prerequisites
- Vercel account
- MongoDB Atlas database
- Git repository (GitHub/GitLab/Bitbucket)

## Step 1: Prepare Backend for Vercel

### 1.1 Update Backend Server
The backend has been configured for Vercel serverless deployment with:
- `api/index.js` - Main serverless function
- `vercel.json` - Vercel configuration
- Environment variables setup

### 1.2 Environment Variables for Backend
Set these in Vercel dashboard:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Step 2: Prepare Frontend for Vercel

### 2.1 Frontend Configuration
Frontend is configured with:
- `vercel.json` - Build configuration
- `.env.production` - Production environment variables
- API proxy configuration

### 2.2 Environment Variables for Frontend
Set these in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
REACT_APP_SOCKET_URL=https://your-backend-url.vercel.app
REACT_APP_ENV=production
```

## Step 3: Deploy Backend

### 3.1 Push to Git Repository
```bash
cd backend
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 3.2 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the backend folder
5. Configure environment variables
6. Click "Deploy"

### 3.3 Backend URL
After deployment, note your backend URL:
`https://your-backend-name.vercel.app`

## Step 4: Deploy Frontend

### 4.1 Update Frontend API URL
Update `.env.production` with your backend URL:
```
REACT_APP_API_URL=https://your-backend-name.vercel.app
REACT_APP_SOCKET_URL=https://your-backend-name.vercel.app
```

### 4.2 Push to Git Repository
```bash
cd frontend
git add .
git commit -m "Configure for production deployment"
git push origin main
```

### 4.3 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the frontend folder
5. Configure environment variables
6. Click "Deploy"

## Step 5: Post-Deployment Configuration

### 5.1 Test the Application
1. Visit your frontend URL
2. Test login functionality
3. Test inventory management
4. Test real-time features

### 5.2 Configure Custom Domains (Optional)
1. In Vercel dashboard, go to project settings
2. Add custom domain
3. Update DNS records
4. Update CORS origins if needed

### 5.3 Monitor Performance
1. Check Vercel Analytics
2. Monitor error logs
3. Set up alerts for issues

## Troubleshooting

### Common Issues

#### 1. CORS Errors
Update CORS origins in backend:
```javascript
cors({
  origin: ['https://your-frontend-url.vercel.app'],
  credentials: true
})
```

#### 2. Socket.io Connection Issues
Update Socket.io CORS in backend:
```javascript
const io = new Server(server, {
  cors: {
    origin: ['https://your-frontend-url.vercel.app'],
    credentials: true
  }
});
```

#### 3. Environment Variables Not Loading
Ensure all environment variables are set in Vercel dashboard with correct names.

#### 4. Build Failures
Check build logs for specific errors and ensure all dependencies are installed.

#### 5. Database Connection Issues
Verify MongoDB URI is correct and accessible from Vercel.

## Deployment URLs Structure

### Backend
- API: `https://your-backend.vercel.app/api/*`
- Socket.io: `https://your-backend.vercel.app`
- Health check: `https://your-backend.vercel.app/health`

### Frontend
- Main app: `https://your-frontend.vercel.app`
- All routes: Handled by React Router

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Database Security**: Use MongoDB Atlas with IP whitelisting
3. **API Security**: Implement rate limiting and authentication
4. **HTTPS**: Vercel automatically provides SSL certificates
5. **File Uploads**: Validate file types and sizes

## Performance Optimization

1. **Image Optimization**: Compress profile photos
2. **Caching**: Implement API response caching
3. **Bundle Size**: Optimize frontend bundle
4. **Database Indexing**: Ensure proper MongoDB indexes

## Monitoring and Maintenance

1. **Error Tracking**: Set up error monitoring
2. **Performance Monitoring**: Use Vercel Analytics
3. **Database Monitoring**: Monitor MongoDB performance
4. **Regular Updates**: Keep dependencies updated

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review this guide
3. Check environment variables
4. Test API endpoints individually

Your Smart Inventory System is now live on Vercel!
