const dotenv = require('dotenv');
const express = require('express');
const { Pool } = require('pg');
const { json } = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { body, param, query, validationResult } = require('express-validator');
const NodeCache = require('node-cache');
const winston = require('winston');
const { debounce } = require('lodash');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');





// Load environment variables from .env file
dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;


// Initialize cache
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    });

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    logger.error('Database connection error:', err);
    process.exit(1);
  } else {
    logger.info('Database connection successful');
  }
});


// Middleware
app.use(helmet()); // Add security headers
app.use(json()); // Parse JSON request bodies
app.use(morgan('dev')); // HTTP request logging
app.use(cors()); // Enable CORS for all routes
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes



// Error handling middleware
const handleError = (res, error) => {
  logger.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message
  });
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Cache middleware
const cacheMiddleware = (key, ttl = 300) => {
  return (req, res, next) => {
    const cacheKey = `${key}-${JSON.stringify(req.query)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(cacheKey, body, ttl);
      res.sendResponse(body);
    };
    next();
  };
};


// Debounced query function
const debouncedQuery = debounce(async (query, params, callback) => {
  try {
    const result = await pool.query(query, params);
    callback(null, result);
  } catch (error) {
    callback(error);
  }
}, 300);

// Routes

// Utility function for error handling
const handleDbError = (res, error) => {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  };


/// GET all inventory items with category and supplier info
app.get('/api/inventory_items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*, 
        c.name as category, 
        s.name as supplier_name,
        (i.in_stock - i.reserved) as available
      FROM 
        inventory_items i
      LEFT JOIN 
        categories c ON i.category_id = c.id
      LEFT JOIN 
        suppliers s ON i.supplier_id = s.id
      ORDER BY 
        i.id
    `);
    res.json(result.rows);
  } catch (error) {
    handleDbError(res, error);
  }
});

// GET a single inventory item by ID
app.get('/api/inventory_items/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await pool.query(`
        SELECT 
          i.*, 
          c.name as category, 
          s.name as supplier_name,
          (i.in_stock - i.reserved) as available
        FROM 
          inventory_items i
        LEFT JOIN 
          categories c ON i.category_id = c.id
        LEFT JOIN 
          suppliers s ON i.supplier_id = s.id
        WHERE 
          i.id = $1
      `, [req.params.id]);
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
      res.json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// POST a new inventory item
app.post('/api/inventory_items',
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('sku').isString().notEmpty().withMessage('SKU is required'),
  body('category_id').isInt().withMessage('Valid category is required'),
  body('in_stock').isInt({ min: 0 }).withMessage('In stock must be a positive number'),
  body('reserved').optional().isInt({ min: 0 }).withMessage('Reserved must be a positive number'),
  body('low_stock_threshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a positive number'),
  body('supplier_id').isInt().withMessage('Valid supplier is required'),
  body('location').optional().isString(),
  body('description').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { 
      name, 
      sku, 
      category_id, 
      in_stock, 
      reserved = 0, 
      low_stock_threshold = 10, 
      supplier_id, 
      location, 
      description 
    } = req.body;

    try {
      // Check if SKU already exists
      const skuCheck = await pool.query('SELECT id FROM inventory_items WHERE sku = $1', [sku]);
      if (skuCheck.rows.length > 0) {
        return res.status(400).json({ error: 'SKU already exists' });
      }

      const result = await pool.query(
        `INSERT INTO inventory_items 
          (name, sku, category_id, in_stock, reserved, low_stock_threshold, supplier_id, location, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [name, sku, category_id, in_stock, reserved, low_stock_threshold, supplier_id, location, description]
      );

      // Get category and supplier names for the response
      const fullItem = await pool.query(`
        SELECT 
          i.*, 
          c.name as category, 
          s.name as supplier_name,
          (i.in_stock - i.reserved) as available
        FROM 
          inventory_items i
        LEFT JOIN 
          categories c ON i.category_id = c.id
        LEFT JOIN 
          suppliers s ON i.supplier_id = s.id
        WHERE 
          i.id = $1
      `, [result.rows[0].id]);

      res.status(201).json(fullItem.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// PUT (update) an inventory item by ID
app.put('/api/inventory_items/:id',
  param('id').isInt(),
  body('name').optional().isString(),
  body('sku').optional().isString(),
  body('category_id').optional().isInt(),
  body('in_stock').optional().isInt({ min: 0 }),
  body('reserved').optional().isInt({ min: 0 }),
  body('low_stock_threshold').optional().isInt({ min: 0 }),
  body('supplier_id').optional().isInt(),
  body('location').optional().isString(),
  body('description').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const { 
      name, 
      sku, 
      category_id, 
      in_stock, 
      reserved, 
      low_stock_threshold, 
      supplier_id, 
      location, 
      description 
    } = req.body;

    try {
      // Check if item exists
      const itemCheck = await pool.query('SELECT id FROM inventory_items WHERE id = $1', [id]);
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // If SKU is being updated, check it doesn't conflict
      if (sku) {
        const skuCheck = await pool.query('SELECT id FROM inventory_items WHERE sku = $1 AND id != $2', [sku, id]);
        if (skuCheck.rows.length > 0) {
          return res.status(400).json({ error: 'SKU already exists' });
        }
      }

      const result = await pool.query(
        `UPDATE inventory_items SET 
          name = COALESCE($1, name), 
          sku = COALESCE($2, sku), 
          category_id = COALESCE($3, category_id), 
          in_stock = COALESCE($4, in_stock), 
          reserved = COALESCE($5, reserved), 
          low_stock_threshold = COALESCE($6, low_stock_threshold), 
          supplier_id = COALESCE($7, supplier_id), 
          location = COALESCE($8, location), 
          description = COALESCE($9, description),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 
         RETURNING *`,
        [name, sku, category_id, in_stock, reserved, low_stock_threshold, supplier_id, location, description, id]
      );

      // Get category and supplier names for the response
      const fullItem = await pool.query(`
        SELECT 
          i.*, 
          c.name as category, 
          s.name as supplier_name,
          (i.in_stock - i.reserved) as available
        FROM 
          inventory_items i
        LEFT JOIN 
          categories c ON i.category_id = c.id
        LEFT JOIN 
          suppliers s ON i.supplier_id = s.id
        WHERE 
          i.id = $1
      `, [id]);

      res.json(fullItem.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// DELETE an inventory item by ID
app.delete('/api/inventory_items/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
      res.json({ message: 'Item deleted successfully', id: result.rows[0].id });
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// CATEGORIES ENDPOINTS

// GET all categories with item counts
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.name, 
        c.description,
        COUNT(i.id) as item_count
      FROM 
        categories c
      LEFT JOIN 
        inventory_items i ON c.id = i.category_id
      GROUP BY 
        c.id
      ORDER BY 
        c.name
    `);
    res.json(result.rows);
  } catch (error) {
    handleDbError(res, error);
  }
});

// GET a single category by ID
app.get('/api/categories/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
      res.json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// POST a new category
app.post('/api/categories',
  body('name').isString().notEmpty(),
  body('description').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    
    try {
      // Check if category name already exists
      const nameCheck = await pool.query('SELECT id FROM categories WHERE name = $1', [name]);
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// PUT (update) a category by ID
app.put('/api/categories/:id',
  param('id').isInt(),
  body('name').optional().isString(),
  body('description').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    
    try {
      // Check if category exists
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [req.params.id]);
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
        error: 'Category not found' });
      }

      // If name is being updated, check it doesn't conflict
      if (name) {
        const nameCheck = await pool.query(
          'SELECT id FROM categories WHERE name = $1 AND id != $2', 
          [name, req.params.id]
        );
        if (nameCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
      }

      const result = await pool.query(
        'UPDATE categories SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
        [name, description, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// DELETE a category by ID
app.delete('/api/categories/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const deleteItems = req.query.deleteItems === 'true';

    try {
      if (!deleteItems) {
        // Check if category is in use
        const usageCheck = await pool.query('SELECT id FROM inventory_items WHERE category_id = $1 LIMIT 1', [req.params.id]);
        if (usageCheck.rows.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete category that is in use',
            message: 'This category is assigned to one or more inventory_items items'
          });
        }
      } else {
        // Delete associated inventory items first
        await pool.query('DELETE FROM inventory_items WHERE category_id = $1', [req.params.id]);
      }

      // Delete the category
      const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      handleDbError(res, error);
    }
  }
);


// SUPPLIERS ENDPOINTS

// GET all suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        COUNT(i.id) as item_count
      FROM 
        suppliers s
      LEFT JOIN 
        inventory_items i ON s.id = i.supplier_id
      GROUP BY 
        s.id
      ORDER BY 
        s.name
    `);
    res.json(result.rows);
  } catch (error) {
    handleDbError(res, error);
  }
});

// GET a single supplier by ID
app.get('/api/suppliers/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
      res.json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// POST a new supplier
app.post('/api/suppliers',
  body('name').isString().notEmpty(),
  body('contact_name').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, contact_name, email, phone, address } = req.body;
    
    try {
      const result = await pool.query(
        'INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, contact_name, email, phone, address]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// PUT (update) a supplier by ID
app.put('/api/suppliers/:id',
  param('id').isInt(),
  body('name').optional().isString(),
  body('contact_name').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, contact_name, email, phone, address } = req.body;
    
    try {
      const result = await pool.query(
        `UPDATE suppliers SET 
          name = COALESCE($1, name), 
          contact_name = COALESCE($2, contact_name), 
          email = COALESCE($3, email), 
          phone = COALESCE($4, phone), 
          address = COALESCE($5, address) 
         WHERE id = $6 RETURNING *`,
        [name, contact_name, email, phone, address, req.params.id]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
      res.json(result.rows[0]);
    } catch (error) {
      handleDbError(res, error);
    }
  }
);

// DELETE a supplier by ID
app.delete('/api/suppliers/:id', 
  param('id').isInt(), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // Check if supplier is in use
      const usageCheck = await pool.query('SELECT id FROM inventory_items WHERE supplier_id = $1 LIMIT 1', [req.params.id]);
      if (usageCheck.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete supplier that is in use',
          message: 'This supplier is assigned to one or more inventory_items items'
        });
      }

      const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
      res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
      handleDbError(res, error);
    }
  }
);




// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;