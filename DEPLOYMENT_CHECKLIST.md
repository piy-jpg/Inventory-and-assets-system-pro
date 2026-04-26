# Vercel Deployment Checklist

## Pre-Deployment Checklist

### Backend Preparation
- [x] Created `api/index.js` for serverless deployment
- [x] Added `vercel.json` configuration
- [x] Updated `package.json` with deployment scripts
- [x] Configured environment variables structure
- [x] Set up CORS for production URLs
- [x] Configured Socket.io for production

### Frontend Preparation
- [x] Created `vercel.json` configuration
- [x] Updated `.env.production` with production variables
- [x] Added deployment scripts to `package.json`
- [x] Configured API proxy for production
- [x] Updated build configuration

### Database & Security
- [x] MongoDB Atlas connection ready
- [x] JWT secret key prepared
- [x] Environment variables documented
- [x] CORS origins configured
- [x] File upload security implemented

## Deployment Steps

### 1. Backend Deployment
```bash
cd backend
vercel --prod --name smart-inventory-backend
```

### 2. Get Backend URL
After deployment, note the URL: `https://smart-inventory-backend.vercel.app`

### 3. Update Frontend Environment
Update `.env.production` with the backend URL

### 4. Frontend Deployment
```bash
cd frontend
vercel --prod --name smart-inventory-frontend
```

### 5. Set Environment Variables
In Vercel dashboard, set:
- Backend: `MONGODB_URI`, `JWT_SECRET`
- Frontend: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`

## Post-Deployment Testing

### Basic Functionality
- [ ] Login/Register works
- [ ] Dashboard loads correctly
- [ ] Inventory management functions
- [ ] Real-time updates work
- [ ] Profile photo upload works

### API Testing
- [ ] Health check: `https://backend-url.vercel.app/health`
- [ ] Authentication endpoints
- [ ] Inventory CRUD operations
- [ ] File upload functionality

### Performance & Security
- [ ] Page load times acceptable
- [ ] Mobile responsive design
- [ ] SSL certificate active
- [ ] Error handling works
- [ ] Rate limiting active

## Environment Variables Reference

### Backend Required Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
```

### Frontend Required Variables
```
REACT_APP_API_URL=https://backend-url.vercel.app
REACT_APP_SOCKET_URL=https://backend-url.vercel.app
REACT_APP_ENV=production
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. CORS Errors
- Verify frontend URL in backend CORS config
- Check environment variables are set correctly
- Ensure both frontend and backend are deployed

#### 2. Socket.io Connection Issues
- Check Socket.io CORS configuration
- Verify WebSocket connections are allowed
- Test with different browsers

#### 3. Database Connection
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

#### 4. File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Test with different file formats

#### 5. Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are installed
- Ensure environment variables are correct

## Monitoring & Maintenance

### Regular Tasks
- [ ] Monitor Vercel analytics
- [ ] Check error logs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review performance metrics

### Scaling Considerations
- [ ] Monitor API response times
- [ ] Check database performance
- [ ] Consider CDN for static assets
- [ ] Implement caching strategies

## Emergency Procedures

### If Deployment Fails
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with same configuration
4. Roll back to previous version if needed

### If Application is Down
1. Check Vercel status page
2. Verify database connectivity
3. Check recent deployments
4. Contact Vercel support if needed

## Contact Information
- Vercel Dashboard: https://vercel.com/dashboard
- Project URLs: Available in Vercel dashboard
- Support: Check Vercel documentation

---

## Quick Deployment Command

For automated deployment, run:
```bash
./deploy.sh
```

This will deploy both backend and frontend and update environment variables automatically.
