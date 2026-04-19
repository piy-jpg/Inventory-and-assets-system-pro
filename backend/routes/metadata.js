const express = require('express');
const Unit = require('../models/Unit');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Warranty = require('../models/Warranty');
const { authMiddleware } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

const registerMetadataRoutes = ({ key, path, Model }) => {
  router.get(path, authMiddleware, async (req, res, next) => {
    try {
      const items = await Model.find().sort({ name: 1 });
      res.json({ success: true, data: { [key]: items } });
    } catch (error) {
      next(error);
    }
  });

  router.post(path, authMiddleware, async (req, res, next) => {
    try {
      const currentUserId = await getCurrentUserId(req.user);
      if (!currentUserId) {
        return res.status(401).json({ success: false, message: 'Authenticated user not found' });
      }

      const item = new Model({ ...req.body, created_by: currentUserId });
      await item.save();
      res.status(201).json({ success: true, data: { [key.slice(0, -1)]: item } });
    } catch (error) {
      next(error);
    }
  });

  router.put(`${path}/:id`, authMiddleware, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!item) {
        return res.status(404).json({ success: false, message: `${key.slice(0, -1)} not found` });
      }

      res.json({ success: true, data: { [key.slice(0, -1)]: item } });
    } catch (error) {
      next(error);
    }
  });

  router.delete(`${path}/:id`, authMiddleware, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({ success: false, message: `${key.slice(0, -1)} not found` });
      }

      res.json({ success: true, message: `${key.slice(0, -1)} deleted successfully` });
    } catch (error) {
      next(error);
    }
  });
};

registerMetadataRoutes({ key: 'units', path: '/units', Model: Unit });
registerMetadataRoutes({ key: 'brands', path: '/brands', Model: Brand });
registerMetadataRoutes({ key: 'categories', path: '/categories', Model: Category });
registerMetadataRoutes({ key: 'warranties', path: '/warranties', Model: Warranty });

module.exports = router;
