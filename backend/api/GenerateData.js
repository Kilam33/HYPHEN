import 'dotenv/config';
import { faker } from '@faker-js/faker';
import pkg from 'pg';
const { Pool } = pkg;



console.log(process.env.DB_USER, process.env.DB_HOST, process.env.DB_NAME);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});



// Create the tables if they don't exist
const createTables = async () => {
  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      seasonality_factor FLOAT DEFAULT 1.0
    );
  `;

  const createSuppliersTable = `
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      lead_time_days INTEGER DEFAULT 7,
      reliability_score FLOAT DEFAULT 0.9
    );
  `;

  const createInventoryItemsTable = `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      price DECIMAL(10, 2) NOT NULL,
      cost DECIMAL(10, 2) NOT NULL,
      in_stock INTEGER DEFAULT 0,
      reserved INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 20,
      supplier_id INTEGER REFERENCES suppliers(id),
      location VARCHAR(255),
      popularity_score FLOAT DEFAULT 1.0,
      days_to_expire INTEGER DEFAULT NULL
    );
  `;

  const createInventoryTransactionsTable = `
    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      transaction_date TIMESTAMP NOT NULL,
      transaction_type VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      reference_id VARCHAR(255),
      notes TEXT
    );
  `;

  const createPurchaseOrdersTable = `
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      supplier_id INTEGER REFERENCES suppliers(id),
      order_date TIMESTAMP NOT NULL,
      expected_delivery_date TIMESTAMP,
      actual_delivery_date TIMESTAMP,
      status VARCHAR(50) NOT NULL,
      total_cost DECIMAL(10, 2)
    );
  `;

  const createPurchaseOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id SERIAL PRIMARY KEY,
      purchase_order_id INTEGER REFERENCES purchase_orders(id),
      item_id INTEGER REFERENCES inventory_items(id),
      quantity INTEGER NOT NULL,
      unit_cost DECIMAL(10, 2) NOT NULL
    );
  `;

  const createReorderSuggestionsTable = `
    CREATE TABLE IF NOT EXISTS reorder_suggestions (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      suggested_date DATE NOT NULL DEFAULT CURRENT_DATE,
      suggested_quantity INTEGER NOT NULL,
      urgency_level VARCHAR(20) NOT NULL,
      days_until_stockout FLOAT,
      expected_lead_time INTEGER,
      suggested_order_date DATE,
      suggested_supplier_id INTEGER REFERENCES suppliers(id),
      status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;


  await pool.query(createCategoriesTable);
  await pool.query(createSuppliersTable);
  await pool.query(createInventoryItemsTable);
  await pool.query(createInventoryTransactionsTable);
  await pool.query(createPurchaseOrdersTable);
  await pool.query(createPurchaseOrderItemsTable);
  await pool.query(createReorderSuggestionsTable);
};



// Populate reorder suggestions
const createReorderSuggestions = async () => {
  const insertSuggestionsSQL = `
  INSERT INTO reorder_suggestions 
  (item_id, suggested_quantity, urgency_level, days_until_stockout, expected_lead_time, suggested_order_date, suggested_supplier_id)
  SELECT 
    r.item_id,
    r.recommended_order_quantity,
    r.stock_status,
    CASE 
      WHEN r.avg_daily_demand = 0 THEN 999
      ELSE r.available_stock / NULLIF(r.avg_daily_demand, 0)
    END as days_until_stockout,
    s.lead_time_days,
    CURRENT_DATE + INTERVAL '1 day' * GREATEST(0, 
      CASE 
        WHEN r.avg_daily_demand = 0 THEN 30
        ELSE FLOOR(r.available_stock / NULLIF(r.avg_daily_demand, 0)) - s.lead_time_days
      END
    ) as suggested_order_date,
    i.supplier_id
  FROM reorder_recommendations r
  JOIN inventory_items i ON r.item_id = i.id
  JOIN suppliers s ON i.supplier_id = s.id
  WHERE r.recommended_order_quantity > 0;
`;

  await pool.query(insertSuggestionsSQL);
  console.log('Reorder suggestions created.');
};

// Generate Suppliers with varying reliability and lead times
const generateSuppliers = async () => {
  const supplierLocations = [
    'Local',
    'Regional',
    'National',
    'International',
    'Overseas'
  ];

  for (let i = 0; i < 15; i++) {
    const location = faker.helpers.arrayElement(supplierLocations);
    // Lead time increases with distance
    let leadTimeDays = 3;
    let reliabilityScore = 0.98;

    switch (location) {
      case 'Regional':
        leadTimeDays = faker.number.int({ min: 4, max: 7 });
        reliabilityScore = faker.number.float({ min: 0.92, max: 0.97, precision: 0.01 });
        break;
      case 'National':
        leadTimeDays = faker.number.int({ min: 7, max: 14 });
        reliabilityScore = faker.number.float({ min: 0.85, max: 0.94, precision: 0.01 });
        break;
      case 'International':
        leadTimeDays = faker.number.int({ min: 14, max: 30 });
        reliabilityScore = faker.number.float({ min: 0.75, max: 0.90, precision: 0.01 });
        break;
      case 'Overseas':
        leadTimeDays = faker.number.int({ min: 30, max: 60 });
        reliabilityScore = faker.number.float({ min: 0.65, max: 0.85, precision: 0.01 });
        break;
    }

    await pool.query(
      'INSERT INTO suppliers (name, email, phone, address, lead_time_days, reliability_score) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        `${faker.company.name()} ${location} Supply`,
        faker.internet.email(),
        faker.phone.number(),
        faker.location.streetAddress(),
        leadTimeDays,
        reliabilityScore
      ]
    );
  }
};




// Generate more detailed Inventory Items with pricing and popularity
const generateInventoryItems = async () => {
  const categories = await pool.query('SELECT id, name FROM categories');
  const suppliers = await pool.query('SELECT id FROM suppliers');
  const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Store Backroom', 'Distribution Center'];

  // Define product templates by category for more realistic data
  const productTemplates = {
    'Accessories': [
      { prefix: 'Premium Phone Case for ', suffix: '', price_range: [15, 45], popularity: [0.8, 1.7] },
      { prefix: 'Protective Screen for ', suffix: '', price_range: [8, 25], popularity: [1.0, 1.5] },
      { prefix: 'Stylus Pen for ', suffix: ' Tablets', price_range: [10, 40], popularity: [0.5, 1.2] },
    ],
    'Audio': [
      { prefix: 'Wireless Earbuds ', suffix: '', price_range: [40, 150], popularity: [1.2, 2.0] },
      { prefix: 'Noise-Canceling Headphones ', suffix: '', price_range: [80, 300], popularity: [0.8, 1.6] },
      { prefix: 'Bluetooth Speaker ', suffix: '', price_range: [30, 200], popularity: [0.9, 1.8] },
    ],
    // Add similar templates for other categories
  };

  // Phone models and brands for accessories
  const phoneModels = ['iPhone 13', 'iPhone 14', 'iPhone 15', 'Galaxy S22', 'Galaxy S23', 'Google Pixel 7', 'Xiaomi 13', 'OnePlus 11'];
  const laptopBrands = ['MacBook', 'Dell XPS', 'HP Spectre', 'Lenovo ThinkPad', 'ASUS ZenBook', 'Microsoft Surface'];

  // Create 500 inventory items
  for (let i = 0; i < 500; i++) {
    const category = faker.helpers.arrayElement(categories.rows);
    const templates = productTemplates[category.name] || [{ prefix: '', suffix: '', price_range: [10, 200], popularity: [0.5, 1.5] }];
    const template = faker.helpers.arrayElement(templates);

    let productName = '';
    if (category.name === 'Accessories' || category.name === 'Mobile') {
      productName = `${template.prefix}${faker.helpers.arrayElement(phoneModels)}${template.suffix}`;
    } else if (category.name === 'Peripherals') {
      productName = `${template.prefix}${faker.helpers.arrayElement(laptopBrands)}${template.suffix}`;
    } else {
      productName = faker.commerce.productName();
    }

    const cost = faker.number.float({ min: template.price_range[0] * 0.5, max: template.price_range[1] * 0.7, precision: 0.01 });
    const price = cost * (1 + faker.number.float({ min: 0.2, max: 0.6, precision: 0.01 })); // 20-60% margin

    const popularityScore = faker.number.float({ min: template.popularity[0], max: template.popularity[1], precision: 0.01 });

    // Some products have expiration dates (like batteries)
    const daysToExpire = ['Power', 'Printing'].includes(category.name) ?
      faker.number.int({ min: 180, max: 720 }) : null;

    await pool.query(
      `INSERT INTO inventory_items 
       (name, sku, category_id, price, cost, in_stock, reserved, low_stock_threshold, supplier_id, location, popularity_score, days_to_expire) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        productName,
        faker.string.alphanumeric(10).toUpperCase(),
        category.id,
        price,
        cost,
        faker.number.int({ min: 0, max: 200 }),
        faker.number.int({ min: 0, max: 20 }),
        faker.number.int({ min: 10, max: 50 }),
        faker.helpers.arrayElement(suppliers.rows).id,
        faker.helpers.arrayElement(locations),
        popularityScore,
        daysToExpire
      ]
    );
  }
};

const generateCategories = async () => {
  console.log("Generating categories...");

  const categories = [
    { name: "Accessories", description: "Various mobile and laptop accessories", seasonality_factor: 1.1 },
    { name: "Audio", description: "Speakers, headphones, and audio devices", seasonality_factor: 1.2 },
    { name: "Peripherals", description: "Keyboards, mice, and other computer peripherals", seasonality_factor: 1.0 },
    { name: "Power", description: "Batteries, chargers, and power banks", seasonality_factor: 1.3 },
    { name: "Printing", description: "Printers, toners, and printing accessories", seasonality_factor: 0.9 }
  ];

  for (const category of categories) {
    await pool.query(
      `INSERT INTO categories (name, description, seasonality_factor) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (name) DO NOTHING;`,
      [category.name, category.description, category.seasonality_factor]
    );
  }

  console.log("Categories generated successfully.");
};

// Generate 3 months of historical transaction data
const generateTransactionHistory = async () => {
  const items = await pool.query('SELECT id, category_id, popularity_score FROM inventory_items');
  const categories = await pool.query('SELECT id, seasonality_factor FROM categories');

  // Map categories to their seasonality factors
  const categorySeasonality = {};
  categories.rows.forEach(cat => {
    categorySeasonality[cat.id] = cat.seasonality_factor;
  });

  // Create date range for 90 days (3 months) of history
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 90);

  console.log('Generating transactions from', startDate, 'to', endDate);

  // Transaction types and their probabilities
  const transactionTypes = [
    { type: 'SALE', probability: 0.7 },
    { type: 'RETURN', probability: 0.1 },
    { type: 'ADJUSTMENT', probability: 0.05 },
    { type: 'DAMAGED', probability: 0.03 },
    { type: 'TRANSFER_IN', probability: 0.06 },
    { type: 'TRANSFER_OUT', probability: 0.06 }
  ];

  // Generate about 10,000 transactions over the 3-month period
  const batchSize = 1000;
  for (let batch = 0; batch < 10; batch++) {
    console.log(`Generating transaction batch ${batch + 1}/10...`);

    const transactionBatch = [];

    for (let i = 0; i < batchSize; i++) {
      const randomItem = faker.helpers.arrayElement(items.rows);
      const popularityFactor = randomItem.popularity_score;
      const seasonalityFactor = categorySeasonality[randomItem.category_id] || 1.0;

      // Generate date within the last 90 days
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

      // Adjust for day of week (weekends have more sales)
      const dayOfWeek = randomDate.getDay();
      const dayFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1.0;

      // Adjust for time of month (beginning and end of month patterns)
      const dayOfMonth = randomDate.getDate();
      const monthFactor = (dayOfMonth <= 5 || dayOfMonth >= 25) ? 1.3 : 1.0;

      // Select transaction type with weighted probability
      let transactionType;
      let random = Math.random();
      let cumulativeProbability = 0;
      for (const type of transactionTypes) {
        cumulativeProbability += type.probability;
        if (random <= cumulativeProbability) {
          transactionType = type.type;
          break;
        }
      }

      // Calculate quantity based on all factors
      let baseQuantity = Math.max(1, Math.floor(Math.random() * 5 * popularityFactor * seasonalityFactor * dayFactor * monthFactor));

      // Adjust quantity based on transaction type
      let quantity;
      let notes = null;
      switch (transactionType) {
        case 'SALE':
          quantity = -baseQuantity; // negative for outgoing inventory
          break;
        case 'RETURN':
          quantity = Math.max(1, Math.floor(baseQuantity * 0.5)); // returns are usually smaller
          notes = faker.helpers.arrayElement(['Customer dissatisfied', 'Wrong size', 'Defective product', 'Changed mind', 'Ordered wrong item']);
          break;
        case 'ADJUSTMENT':
          // Adjustments can be positive or negative after inventory audits
          quantity = Math.random() > 0.5 ? Math.floor(baseQuantity * 0.3) : -Math.floor(baseQuantity * 0.3);
          notes = faker.helpers.arrayElement(['Inventory audit', 'System reconciliation', 'Found misplaced items', 'Counting error']);
          break;
        case 'DAMAGED':
          quantity = -Math.max(1, Math.floor(baseQuantity * 0.2)); // negative for damaged goods
          notes = faker.helpers.arrayElement(['Shipping damage', 'Storage damage', 'Handling error', 'Product defect', 'Expired']);
          break;
        case 'TRANSFER_IN':
          quantity = Math.max(1, Math.floor(baseQuantity * 0.7));
          notes = `Transfer from ${faker.helpers.arrayElement(['Warehouse A', 'Warehouse B', 'Warehouse C', 'Store #102', 'Distribution Center'])}`;
          break;
        case 'TRANSFER_OUT':
          quantity = -Math.max(1, Math.floor(baseQuantity * 0.7));
          notes = `Transfer to ${faker.helpers.arrayElement(['Warehouse A', 'Warehouse B', 'Warehouse C', 'Store #102', 'Distribution Center'])}`;
          break;
        default:
          quantity = baseQuantity;
      }

      // Generate a reference id for the transaction
      const referenceId = transactionType === 'SALE' ?
        `ORD-${faker.string.alphanumeric(8).toUpperCase()}` :
        `REF-${faker.string.alphanumeric(8).toUpperCase()}`;

      transactionBatch.push({
        item_id: randomItem.id,
        transaction_date: randomDate,
        transaction_type: transactionType,
        quantity: quantity,
        reference_id: referenceId,
        notes: notes
      });
    }

    // Bulk insert the batch
    const queryText = `
    INSERT INTO inventory_transactions 
    (item_id, transaction_date, transaction_type, quantity, reference_id, notes)
    VALUES 
    ${transactionBatch.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
  `;

    const queryParams = transactionBatch.flatMap(t => [
      t.item_id, t.transaction_date, t.transaction_type, t.quantity,
      t.reference_id, t.notes
    ]);

    await pool.query(queryText, queryParams);
  }
};

// Generate purchase orders based on inventory levels and lead times
const generatePurchaseOrders = async () => {
  console.log('Generating purchase orders...');

  // Fetch suppliers
  const suppliers = await pool.query('SELECT id, lead_time_days, reliability_score FROM suppliers');

  // Fetch inventory items
  const items = await pool.query('SELECT id, supplier_id, in_stock, low_stock_threshold, cost FROM inventory_items');

  if (!items.rows.length) {
    console.log('No inventory items found. Skipping purchase orders.');
    return;
  }

  // Map items by supplier
  const supplierItems = {};
  items.rows.forEach(item => {
    if (!supplierItems[item.supplier_id]) {
      supplierItems[item.supplier_id] = [];
    }
    supplierItems[item.supplier_id].push(item);
  });

  // Map suppliers by id for quick lookup
  const suppliersById = {};
  suppliers.rows.forEach(supplier => {
    suppliersById[supplier.id] = supplier;
  });

  // Create date range for purchase orders (starting 120 days ago)
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 120); // 30 days earlier than transactions to show initial stock buildup

  // Generate purchase orders
  const purchaseOrders = [];
  for (const supplierId in supplierItems) {
    // Each supplier will have 3-7 purchase orders over the period
    const numOrders = faker.number.int({ min: 3, max: 7 });
    const supplier = suppliersById[supplierId];

    for (let i = 0; i < numOrders; i++) {
      // Generate order date within the range
      const orderDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));

      // Calculate expected delivery based on supplier lead time
      const expectedDeliveryDate = new Date(orderDate);
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + supplier.lead_time_days);

      // Determine if the order was delivered on time, early, or late based on reliability score
      let actualDeliveryDate = null;
      let status = 'PENDING';

      // If expected delivery date is in the past, order should be delivered or cancelled
      if (expectedDeliveryDate < endDate) {
        // Use reliability score to determine if order was fulfilled
        if (Math.random() < supplier.reliability_score) {
          status = 'DELIVERED';

          // Calculate actual delivery date with some variance
          const deliveryVariance = Math.random() > 0.7 ?
            faker.number.int({ min: -3, max: 3 }) : // 70% chance of minor variance (-3 to +3 days)
            faker.number.int({ min: -1, max: 7 }); // 30% chance of more significant delay

          actualDeliveryDate = new Date(expectedDeliveryDate);
          actualDeliveryDate.setDate(actualDeliveryDate.getDate() + deliveryVariance);

          // Ensure actual delivery date isn't in the future
          if (actualDeliveryDate > endDate) {
            actualDeliveryDate = new Date(endDate);
          }
        } else {
          // Order was cancelled or partially delivered
          status = Math.random() > 0.3 ? 'CANCELLED' : 'PARTIAL';
        }
      } else {
        // Order is still pending
        status = orderDate < endDate ? 'ORDERED' : 'DRAFT';
      }

      // Select items for this order
      const itemsForOrder = faker.helpers.arrayElements(
        supplierItems[supplierId],
        faker.number.int({ min: 1, max: Math.min(8, supplierItems[supplierId].length) })
      );

      // Calculate order total cost
      let totalCost = 0;
      const orderItems = itemsForOrder.map(item => {
        // Order more when stock is below threshold
        const stockRatio = item.in_stock / (item.low_stock_threshold || 20);
        const baseQuantity = stockRatio < 1 ?
          faker.number.int({ min: item.low_stock_threshold, max: item.low_stock_threshold * 2 }) :
          faker.number.int({ min: 5, max: item.low_stock_threshold });

        const quantity = baseQuantity;
        const unitCost = parseFloat(item.cost);
        totalCost += quantity * unitCost;

        return {
          item_id: item.id,
          quantity,
          unit_cost: unitCost
        };
      });

      // Add purchase order to list
      purchaseOrders.push({
        supplier_id: supplierId,
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate,
        actual_delivery_date: actualDeliveryDate,
        status,
        total_cost: totalCost,  // Now correctly referencing the calculated totalCost variable
        items: orderItems
      });
    }
  }

  // Insert purchase orders and their items
  for (const order of purchaseOrders) {
    const result = await pool.query(
      `INSERT INTO purchase_orders (
          supplier_id, order_date, expected_delivery_date, actual_delivery_date, status, total_cost
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        order.supplier_id,
        order.order_date,
        order.expected_delivery_date,
        order.actual_delivery_date,
        order.status,
        order.total_cost
      ]
    );

    const poId = result.rows[0].id;

    // Insert order items
    for (const item of order.items) {
      await pool.query(
        `INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_cost)
           VALUES ($1, $2, $3, $4)`,
        [poId, item.item_id, item.quantity, item.unit_cost]
      );

      // If order was delivered, create inventory transaction for the received stock
      if (order.status === 'DELIVERED' || order.status === 'PARTIAL') {
        const deliveredQuantity = order.status === 'PARTIAL' ?
          Math.floor(item.quantity * faker.number.float({ min: 0.4, max: 0.9 })) :
          item.quantity;

        await pool.query(
          `INSERT INTO inventory_transactions 
             (item_id, transaction_date, transaction_type, quantity, reference_id, notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            item.item_id,
            order.actual_delivery_date,
            'PURCHASE_RECEIPT',
            deliveredQuantity,
            `PO-${poId}`,
            `Receipt from PO #${poId}`
          ]
        );
      }
    }
  }

  console.log('Purchase orders generated successfully.');
};
// Update inventory levels based on transactions
const updateInventoryLevels = async () => {
  console.log('Updating inventory levels based on transaction history...');

  // Get the sum of quantities from transactions for each item
  const result = await pool.query(`
      SELECT item_id, SUM(quantity) as net_quantity
      FROM inventory_transactions
      GROUP BY item_id
    `);

  // Update inventory levels one by one
  for (const row of result.rows) {
    await pool.query(`
        UPDATE inventory_items
        SET in_stock = GREATEST(0, $1)
        WHERE id = $2
      `, [Math.floor(row.net_quantity), row.item_id]);
  }
};

// Generate forecasting data with time-based patterns
const generateForecastingData = async () => {
  console.log('Generating forecasting views...');

  // Create a view for daily sales by category
  const dailySalesView = `
      CREATE OR REPLACE VIEW daily_sales_by_category AS
      SELECT 
        c.name as category,
        DATE_TRUNC('day', t.transaction_date) as date,
        SUM(-t.quantity) as units_sold,
        SUM(-t.quantity * i.price) as revenue
      FROM inventory_transactions t
      JOIN inventory_items i ON t.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE t.transaction_type = 'SALE'
      GROUP BY c.name, DATE_TRUNC('day', t.transaction_date)
      ORDER BY date, category;
    `;

  // Create a view for inventory turnover
  const inventoryTurnoverView = `
      CREATE OR REPLACE VIEW inventory_turnover AS
      WITH sales AS (
        SELECT 
          i.id as item_id,
          i.name as item_name,
          c.name as category,
          SUM(-t.quantity) as units_sold,
          SUM(-t.quantity * i.cost) as cost_of_goods_sold
        FROM inventory_transactions t
        JOIN inventory_items i ON t.item_id = i.id
        JOIN categories c ON i.category_id = c.id
        WHERE t.transaction_type = 'SALE'
        GROUP BY i.id, i.name, c.name
      ),
      avg_inventory AS (
        SELECT 
          i.id as item_id,
          AVG(i.in_stock) as average_inventory_value
        FROM inventory_items i
        GROUP BY i.id
      )
      SELECT 
        s.item_id,
        s.item_name,
        s.category,
        s.units_sold,
        s.cost_of_goods_sold,
        a.average_inventory_value,
        CASE 
          WHEN a.average_inventory_value > 0 
          THEN s.cost_of_goods_sold / (a.average_inventory_value * i.cost)
          ELSE 0 
        END as turnover_ratio
      FROM sales s
      JOIN avg_inventory a ON s.item_id = a.item_id
      JOIN inventory_items i ON s.item_id = i.id
      ORDER BY turnover_ratio DESC;
    `;

  // Create a view for stock-out analysis
  const stockOutAnalysisView = `
      CREATE OR REPLACE VIEW stock_out_analysis AS
      WITH daily_inventory AS (
        SELECT 
          i.id as item_id,
          i.name as item_name,
          c.name as category,
          DATE_TRUNC('day', t.transaction_date) as date,
          SUM(t.quantity) OVER (
            PARTITION BY i.id 
            ORDER BY DATE_TRUNC('day', t.transaction_date)
            RANGE UNBOUNDED PRECEDING
          ) as running_stock_level
        FROM inventory_items i
        JOIN categories c ON i.category_id = c.id
        JOIN inventory_transactions t ON i.id = t.item_id
        ORDER BY i.id, date
      )
      SELECT
        item_id,
        item_name,
        category,
        date,
        running_stock_level,
        CASE WHEN running_stock_level <= 0 THEN true ELSE false END as stock_out
      FROM daily_inventory
      ORDER BY item_id, date;
    `;

  // Create a view for purchase cycle analysis
  const purchaseCycleView = `
      CREATE OR REPLACE VIEW purchase_cycle_analysis AS
      SELECT
        i.id as item_id,
        i.name as item_name,
        s.name as supplier_name,
        s.lead_time_days,
        COUNT(DISTINCT po.id) as order_count,
        MIN(po.expected_delivery_date - po.order_date) as min_lead_time,
        MAX(po.expected_delivery_date - po.order_date) as max_lead_time,
        AVG(EXTRACT(EPOCH FROM (po.expected_delivery_date - po.order_date))/86400) as avg_lead_time,
        AVG(EXTRACT(EPOCH FROM (po.actual_delivery_date - po.expected_delivery_date))/86400) as avg_delivery_variance
      FROM inventory_items i
      JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN purchase_order_items poi ON i.id = poi.item_id
      LEFT JOIN purchase_orders po ON poi.purchase_order_id = po.id
      WHERE po.actual_delivery_date IS NOT NULL
      GROUP BY i.id, i.name, s.name, s.lead_time_days
      ORDER BY avg_delivery_variance DESC;`;

  // Create a view for seasonality analysis
  const seasonalityView = `
  CREATE OR REPLACE VIEW seasonality_analysis AS
  WITH monthly_sales AS (
    SELECT 
      c.id as category_id,
      c.name as category_name,
      c.seasonality_factor,
      DATE_TRUNC('month', t.transaction_date) as month,
      SUM(-t.quantity) as units_sold
    FROM inventory_transactions t
    JOIN inventory_items i ON t.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    WHERE t.transaction_type = 'SALE'
    GROUP BY c.id, c.name, c.seasonality_factor, DATE_TRUNC('month', t.transaction_date)
  ),
  category_avg AS (
    SELECT
      category_id,
      AVG(units_sold) as avg_monthly_sales
    FROM monthly_sales
    GROUP BY category_id
  )
  SELECT 
    ms.category_id,
    ms.category_name,
    ms.month,
    ms.units_sold,
    ca.avg_monthly_sales,
    ms.units_sold / NULLIF(ca.avg_monthly_sales, 0) as seasonality_index,
    ms.seasonality_factor as configured_factor
  FROM monthly_sales ms
  JOIN category_avg ca ON ms.category_id = ca.category_id
  ORDER BY ms.category_name, ms.month;
`;

  // Create a view for inventory aging analysis
  const inventoryAgingView = `
  CREATE OR REPLACE VIEW inventory_aging_analysis AS
  WITH last_transaction AS (
    SELECT 
      item_id,
      MAX(transaction_date) as last_transaction_date
    FROM inventory_transactions
    WHERE transaction_type IN ('PURCHASE_RECEIPT', 'TRANSFER_IN')
    GROUP BY item_id
  )
  SELECT
    i.id as item_id,
    i.name as item_name,
    c.name as category_name,
    i.in_stock as current_stock,
    lt.last_transaction_date,
    EXTRACT(EPOCH FROM (CURRENT_DATE - lt.last_transaction_date))/86400 as days_since_last_receipt,
    i.days_to_expire,
    CASE 
      WHEN i.days_to_expire IS NOT NULL THEN
        i.days_to_expire - EXTRACT(EPOCH FROM (CURRENT_DATE - lt.last_transaction_date))/86400
      ELSE NULL
    END as days_until_expiration,
    CASE 
      WHEN i.days_to_expire IS NOT NULL THEN
        CASE 
          WHEN (i.days_to_expire - EXTRACT(EPOCH FROM (CURRENT_DATE - lt.last_transaction_date))/86400) < 30 THEN 'Critical'
          WHEN (i.days_to_expire - EXTRACT(EPOCH FROM (CURRENT_DATE - lt.last_transaction_date))/86400) < 90 THEN 'Warning'
          ELSE 'Good'
        END
      ELSE 'Non-Perishable'
    END as expiration_status
  FROM inventory_items i
  JOIN categories c ON i.category_id = c.id
  LEFT JOIN last_transaction lt ON i.id = lt.item_id
  WHERE i.in_stock > 0
  ORDER BY expiration_status, days_until_expiration;
`;

  // Create view for recommended reorder calculations
  const reorderRecommendationsView = `
  CREATE OR REPLACE VIEW reorder_recommendations AS
  WITH item_stats AS (
    SELECT 
      i.id as item_id,
      i.name as item_name,
      i.sku,
      c.name as category_name,
      s.name as supplier_name,
      s.lead_time_days,
      i.in_stock as current_stock,
      i.reserved as reserved_stock,
      i.low_stock_threshold,
      i.popularity_score,
      c.seasonality_factor,
      COALESCE(
        (SELECT SUM(-t.quantity) / 90.0
         FROM inventory_transactions t
         WHERE t.item_id = i.id 
         AND t.transaction_type = 'SALE'
         AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'),
        0
      ) as avg_daily_demand
    FROM inventory_items i
    JOIN categories c ON i.category_id = c.id
    JOIN suppliers s ON i.supplier_id = s.id
  )
  SELECT
    item_id,
    item_name,
    sku,
    category_name,
    supplier_name,
    lead_time_days,
    current_stock,
    reserved_stock,
    current_stock - reserved_stock as available_stock,
    low_stock_threshold,
    avg_daily_demand,
    avg_daily_demand * lead_time_days as demand_during_lead_time,
    CEIL(avg_daily_demand * lead_time_days * 1.5) as safety_stock,
    CASE 
      WHEN (current_stock - reserved_stock) <= low_stock_threshold THEN 'Critical'
      WHEN (current_stock - reserved_stock) <= (avg_daily_demand * lead_time_days) THEN 'Warning'
      ELSE 'OK'
    END as stock_status,
    CASE 
      WHEN (current_stock - reserved_stock) < CEIL(avg_daily_demand * lead_time_days * 1.5) THEN
        CEIL(avg_daily_demand * lead_time_days * 1.5) + low_stock_threshold - (current_stock - reserved_stock)
      ELSE 0
    END as recommended_order_quantity
  FROM item_stats
  ORDER BY stock_status, recommended_order_quantity DESC;
`;

  // Execute the view creation queries
  const createViews = async () => {
    console.log('Creating analytics views...');
    await pool.query(dailySalesView);
    await pool.query(inventoryTurnoverView);
    await pool.query(stockOutAnalysisView);
    await pool.query(purchaseCycleView);
    await pool.query(seasonalityView);
    await pool.query(inventoryAgingView);
    await pool.query(reorderRecommendationsView);
    console.log('Analytics views created successfully.');
  };

  // Add a function to generate future demand forecasts
  const generateDemandForecasts = async () => {
    console.log('Generating demand forecasts...');

    // Create a demand_forecasts table
    const createForecastsTable = `
    CREATE TABLE IF NOT EXISTS demand_forecasts (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      forecast_date DATE NOT NULL,
      forecast_quantity FLOAT NOT NULL,
      confidence_level FLOAT DEFAULT 0.8,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      forecast_method VARCHAR(50) DEFAULT 'time_series'
    );
  `;

    await pool.query(createForecastsTable);

    // Get historical sales data
    const items = await pool.query(`
    SELECT 
      i.id, 
      i.popularity_score, 
      c.seasonality_factor,
      c.id as category_id
    FROM inventory_items i
    JOIN categories c ON i.category_id = c.id
  `);

    // Get daily sales for the past 90 days to establish patterns
    const salesHistory = await pool.query(`
    SELECT 
      item_id,
      DATE_TRUNC('day', transaction_date) as date,
      SUM(-quantity) as units_sold
    FROM inventory_transactions
    WHERE transaction_type = 'SALE'
    AND transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY item_id, DATE_TRUNC('day', transaction_date)
    ORDER BY item_id, date
  `);

    // Create a map of historical sales by item
    const historicalSalesByItem = {};
    salesHistory.rows.forEach(sale => {
      if (!historicalSalesByItem[sale.item_id]) {
        historicalSalesByItem[sale.item_id] = [];
      }
      historicalSalesByItem[sale.item_id].push({
        date: sale.date,
        units_sold: sale.units_sold
      });
    });

    // Generate forecasts for the next 30 days
    const forecastsToInsert = [];
    const now = new Date();

    items.rows.forEach(item => {
      const itemSales = historicalSalesByItem[item.id] || [];

      // Calculate average daily sales if we have history
      let avgDailySales = 0;
      if (itemSales.length > 0) {
        const totalSales = itemSales.reduce((sum, record) => sum + parseFloat(record.units_sold), 0);
        avgDailySales = totalSales / itemSales.length;
      } else {
        // No history? Use popularity score as a proxy (1-3 units for most popular items)
        avgDailySales = item.popularity_score * 0.3;
      }

      // Generate forecasts for the next 30 days
      for (let daysAhead = 1; daysAhead <= 30; daysAhead++) {
        const forecastDate = new Date(now);
        forecastDate.setDate(forecastDate.getDate() + daysAhead);

        // Apply day of week factor (weekends have higher sales)
        const dayOfWeek = forecastDate.getDay();
        const dayFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1.0;

        // Apply seasonality based on month
        const month = forecastDate.getMonth();
        // Add monthly seasonality patterns (e.g., higher in December, lower in February)
        const monthFactor = [1.0, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.2, 1.5][month];

        // Apply category seasonality factor
        const categoryFactor = item.seasonality_factor;

        // Apply some random noise (±10%)
        const randomNoise = 0.9 + (Math.random() * 0.2);

        // Calculate final forecast quantity with all factors
        const forecastQuantity = Math.max(0, avgDailySales * dayFactor * monthFactor * categoryFactor * randomNoise);

        // Add to list of forecasts to insert
        forecastsToInsert.push({
          item_id: item.id,
          forecast_date: forecastDate.toISOString().split('T')[0],
          forecast_quantity: Math.round(forecastQuantity * 10) / 10, // Round to 1 decimal place
          confidence_level: 0.7 + (itemSales.length / 90) * 0.2 // Higher confidence with more history
        });
      }
    });

    // Batch insert forecasts
    const batchSize = 1000;
    for (let i = 0; i < forecastsToInsert.length; i += batchSize) {
      const batch = forecastsToInsert.slice(i, i + batchSize);
      const queryText = `
      INSERT INTO demand_forecasts 
      (item_id, forecast_date, forecast_quantity, confidence_level)
      VALUES 
      ${batch.map((_, j) => `($${j * 4 + 1}, $${j * 4 + 2}, $${j * 4 + 3}, $${j * 4 + 4})`).join(', ')}
    `;

      const queryParams = batch.flatMap(f => [
        f.item_id, f.forecast_date, f.forecast_quantity, f.confidence_level
      ]);

      await pool.query(queryText, queryParams);
    }

    console.log(`Generated ${forecastsToInsert.length} forecast records.`);
  };

  // Generate inventory performance metrics table and data
  const generateInventoryPerformanceMetrics = async () => {
    console.log('Generating inventory performance metrics...');

    // Create table for inventory performance metrics
    const createPerformanceMetricsTable = `
    CREATE TABLE IF NOT EXISTS inventory_performance_metrics (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      category_id INTEGER REFERENCES categories(id),
      measurement_date DATE NOT NULL,
      days_of_supply FLOAT,
      inventory_to_sales_ratio FLOAT,
      fill_rate_percentage FLOAT,
      stockout_frequency INTEGER,
      carrying_cost DECIMAL(10, 2),
      obsolescence_risk_score FLOAT,
      service_level_percentage FLOAT
    );
  `;

    await pool.query(createPerformanceMetricsTable);

    // Get all inventory items with their categories
    const inventoryItems = await pool.query(`
    SELECT i.id, i.category_id, i.in_stock, i.price, i.cost
    FROM inventory_items i
  `);

    // Calculate 90-day sales volume for each item
    const salesData = await pool.query(`
    SELECT 
      item_id,
      SUM(-quantity) as total_sales_volume,
      COUNT(DISTINCT DATE_TRUNC('day', transaction_date)) as days_with_sales,
      COUNT(DISTINCT CASE WHEN quantity < 0 THEN transaction_date ELSE NULL END) as num_sale_transactions
    FROM inventory_transactions
    WHERE transaction_type = 'SALE'
    AND transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY item_id
  `);

    // Map sales data by item_id for easier access
    const salesByItem = {};
    salesData.rows.forEach(row => {
      salesByItem[row.item_id] = row;
    });

    // Create stock-out incidents data
    const stockoutData = await pool.query(`
    WITH daily_stock AS (
      SELECT 
        item_id,
        DATE_TRUNC('day', transaction_date) as day,
        SUM(quantity) OVER (PARTITION BY item_id ORDER BY DATE_TRUNC('day', transaction_date)) as running_stock
      FROM inventory_transactions
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'
    )
    SELECT 
      item_id, 
      COUNT(DISTINCT day) as days_out_of_stock
    FROM daily_stock
    WHERE running_stock <= 0
    GROUP BY item_id
  `);

    // Map stockout data by item_id
    const stockoutsByItem = {};
    stockoutData.rows.forEach(row => {
      stockoutsByItem[row.item_id] = row;
    });

    // Generate performance metrics for each item
    const metricsToInsert = [];
    const measurementDate = new Date();

    inventoryItems.rows.forEach(item => {
      const sales = salesByItem[item.id] || { total_sales_volume: 0, days_with_sales: 1, num_sale_transactions: 0 };
      const stockouts = stockoutsByItem[item.id] || { days_out_of_stock: 0 };

      // Calculate days of supply
      const averageDailySales = sales.total_sales_volume / 90 || 0.1; // Avoid division by zero
      const daysOfSupply = item.in_stock / averageDailySales;

      // Calculate inventory to sales ratio (value of inventory / value of sales)
      const inventoryValue = item.in_stock * item.cost;
      const salesValue = sales.total_sales_volume * item.price;
      const inventoryToSalesRatio = salesValue > 0 ? inventoryValue / salesValue : null;

      // Calculate fill rate (orders fulfilled / total orders)
      const totalDays = 90;
      const fillRate = ((totalDays - stockouts.days_out_of_stock) / totalDays) * 100;

      // Calculate carrying cost (typically 20-30% of inventory value annually)
      const annualCarryingCostRate = 0.25; // 25% 
      const quarterlyCarryingCost = inventoryValue * (annualCarryingCostRate / 4);

      // Calculate obsolescence risk score (0-1, higher means higher risk)
      const turnoverRate = sales.total_sales_volume / (item.in_stock || 1);
      const obsolescenceRiskScore = Math.min(1, Math.max(0, 1 - (turnoverRate / 5)));

      // Calculate service level
      const serviceLevelPercentage = Math.min(100, Math.max(0, 100 - (stockouts.days_out_of_stock / totalDays * 100)));

      metricsToInsert.push({
        item_id: item.id,
        category_id: item.category_id,
        measurement_date: measurementDate.toISOString().split('T')[0],
        days_of_supply: Math.round(daysOfSupply * 10) / 10,
        inventory_to_sales_ratio: inventoryToSalesRatio ? Math.round(inventoryToSalesRatio * 100) / 100 : null,
        fill_rate_percentage: Math.round(fillRate * 10) / 10,
        stockout_frequency: stockouts.days_out_of_stock,
        carrying_cost: Math.round(quarterlyCarryingCost * 100) / 100,
        obsolescence_risk_score: Math.round(obsolescenceRiskScore * 100) / 100,
        service_level_percentage: Math.round(serviceLevelPercentage * 10) / 10
      });
    });

    // Batch insert metrics
    const batchSize = 100;
    for (let i = 0; i < metricsToInsert.length; i += batchSize) {
      const batch = metricsToInsert.slice(i, i + batchSize);
      const queryText = `
      INSERT INTO inventory_performance_metrics 
      (item_id, category_id, measurement_date, days_of_supply, inventory_to_sales_ratio, 
       fill_rate_percentage, stockout_frequency, carrying_cost, obsolescence_risk_score, service_level_percentage)
      VALUES 
      ${batch.map((_, j) => `($${j * 10 + 1}, $${j * 10 + 2}, $${j * 10 + 3}, $${j * 10 + 4}, $${j * 10 + 5}, 
                              $${j * 10 + 6}, $${j * 10 + 7}, $${j * 10 + 8}, $${j * 10 + 9}, $${j * 10 + 10})`).join(', ')}
    `;

      const queryParams = batch.flatMap(m => [
        m.item_id, m.category_id, m.measurement_date, m.days_of_supply, m.inventory_to_sales_ratio,
        m.fill_rate_percentage, m.stockout_frequency, m.carrying_cost, m.obsolescence_risk_score, m.service_level_percentage
      ]);

      await pool.query(queryText, queryParams);
    }

    console.log(`Generated ${metricsToInsert.length} performance metric records.`);

    // Create view for KPI dashboard
    const kpiDashboardView = `
    CREATE OR REPLACE VIEW inventory_kpi_dashboard AS
    SELECT
      c.name as category,
      COUNT(i.id) as number_of_items,
      SUM(i.in_stock) as total_units_in_stock,
      SUM(i.in_stock * i.cost) as total_inventory_value,
      AVG(m.days_of_supply) as avg_days_of_supply,
      AVG(m.fill_rate_percentage) as avg_fill_rate,
      AVG(m.service_level_percentage) as avg_service_level,
      SUM(m.carrying_cost) as total_carrying_cost,
      SUM(CASE WHEN m.obsolescence_risk_score > 0.7 THEN 1 ELSE 0 END) as high_obsolescence_risk_items,
      AVG(m.stockout_frequency) as avg_stockout_days
    FROM inventory_items i
    JOIN categories c ON i.category_id = c.id
    LEFT JOIN inventory_performance_metrics m ON i.id = m.item_id
    GROUP BY c.name
    ORDER BY total_inventory_value DESC;
  `;

    await pool.query(kpiDashboardView);
  };

  // Add inventory optimization parameters for more sophisticated forecasting
  const addInventoryOptimizationParameters = async () => {
    console.log('Adding inventory optimization parameters...');

    // Create table for optimization parameters
    const createOptimizationParametersTable = `
    CREATE TABLE IF NOT EXISTS inventory_optimization_parameters (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      target_service_level FLOAT DEFAULT 0.95,
      reorder_point INTEGER,
      economic_order_quantity INTEGER,
      safety_stock INTEGER,
      max_stock_level INTEGER,
      min_stock_level INTEGER,
      order_cycle_days INTEGER,
      order_cost DECIMAL(10, 2) DEFAULT 50.00,
      holding_cost_percentage FLOAT DEFAULT 0.25,
      stockout_cost_factor FLOAT DEFAULT 1.5
    );
  `;

    await pool.query(createOptimizationParametersTable);

    // Get inventory items with their sales data
    const inventoryItems = await pool.query(`
    SELECT 
      i.id, 
      i.cost, 
      i.low_stock_threshold,
      s.lead_time_days,
      COALESCE(
        (SELECT STDDEV(-quantity) 
         FROM inventory_transactions 
         WHERE item_id = i.id 
         AND transaction_type = 'SALE'),
        0
      ) as demand_stddev,
      COALESCE(
        (SELECT AVG(-quantity) 
         FROM inventory_transactions 
         WHERE item_id = i.id 
         AND transaction_type = 'SALE'),
        1
      ) as avg_order_size,
      COALESCE(
        (SELECT SUM(-quantity) / 90.0
         FROM inventory_transactions
         WHERE item_id = i.id 
         AND transaction_type = 'SALE'
         AND transaction_date >= CURRENT_DATE - INTERVAL '90 days'),
        0.1
      ) as daily_demand
    FROM inventory_items i
    JOIN suppliers s ON i.supplier_id = s.id
  `);

    // Generate optimization parameters for each item
    const parametersToInsert = [];

    inventoryItems.rows.forEach(item => {
      const leadTime = item.lead_time_days;
      const dailyDemand = Math.max(item.daily_demand, 0.1); // Ensure non-zero
      const demandStdDev = item.demand_stddev || 0.5 * dailyDemand; // Default to 50% of demand if no data

      // Calculate safety factor based on target service level (95% = Z-score of 1.65)
      const safetyFactor = 1.65;

      // Calculate safety stock
      const safetyStock = Math.ceil(safetyFactor * demandStdDev * Math.sqrt(leadTime));

      // Calculate reorder point
      const reorderPoint = Math.ceil(dailyDemand * leadTime + safetyStock);

      // Calculate Economic Order Quantity (EOQ)
      const orderCost = 50; // Fixed cost per order
      const annualHoldingCostPerUnit = item.cost * 0.25; // 25% of unit cost
      const annualDemand = dailyDemand * 365;
      const eoq = Math.ceil(Math.sqrt((2 * orderCost * annualDemand) / annualHoldingCostPerUnit));

      // Calculate max stock level
      const maxStockLevel = reorderPoint + eoq;

      // Calculate min stock level
      const minStockLevel = Math.max(safetyStock, item.low_stock_threshold);

      // Calculate order cycle days
      const orderCycleDays = Math.ceil(eoq / dailyDemand);

      parametersToInsert.push({
        item_id: item.id,
        target_service_level: 0.95,
        reorder_point: reorderPoint,
        economic_order_quantity: eoq,
        safety_stock: safetyStock,
        max_stock_level: maxStockLevel,
        min_stock_level: minStockLevel,
        order_cycle_days: orderCycleDays,
        order_cost: 50.00,
        holding_cost_percentage: 0.25,
        stockout_cost_factor: 1.5
      });
    });

    // Finish the batch insert for optimization parameters
    const batchSize = 100;
    for (let i = 0; i < parametersToInsert.length; i += batchSize) {
      const batch = parametersToInsert.slice(i, i + batchSize);
      const queryText = `
    INSERT INTO inventory_optimization_parameters 
    (item_id, target_service_level, reorder_point, economic_order_quantity, safety_stock, 
     max_stock_level, min_stock_level, order_cycle_days, order_cost, holding_cost_percentage, stockout_cost_factor)
    VALUES 
    ${batch.map((_, j) => `($${j * 11 + 1}, $${j * 11 + 2}, $${j * 11 + 3}, $${j * 11 + 4}, $${j * 11 + 5}, 
                          $${j * 11 + 6}, $${j * 11 + 7}, $${j * 11 + 8}, $${j * 11 + 9}, $${j * 11 + 10}, $${j * 11 + 11})`).join(', ')}
  `;

      const queryParams = batch.flatMap(p => [
        p.item_id, p.target_service_level, p.reorder_point, p.economic_order_quantity, p.safety_stock,
        p.max_stock_level, p.min_stock_level, p.order_cycle_days, p.order_cost, p.holding_cost_percentage, p.stockout_cost_factor
      ]);

      await pool.query(queryText, queryParams);
    }

    console.log(`Created optimization parameters for ${parametersToInsert.length} items.`);

    // Create a view for optimization recommendations
    const optimizationRecommendationsView = `
  CREATE OR REPLACE VIEW inventory_optimization_recommendations AS
  SELECT
    i.id as item_id,
    i.name as item_name,
    i.sku,
    c.name as category_name,
    i.in_stock as current_stock,
    op.reorder_point,
    op.safety_stock,
    op.economic_order_quantity as recommended_order_size,
    op.min_stock_level,
    op.max_stock_level,
    i.price,
    i.cost,
    s.name as supplier_name,
    s.lead_time_days,
    CASE 
      WHEN i.in_stock <= op.reorder_point THEN 'Reorder Now'
      WHEN i.in_stock <= op.reorder_point * 1.2 THEN 'Reorder Soon'
      WHEN i.in_stock > op.max_stock_level THEN 'Overstocked'
      ELSE 'Optimal'
    END as stock_status,
    CASE
      WHEN i.in_stock <= op.reorder_point THEN op.economic_order_quantity
      ELSE 0
    END as suggested_order_quantity,
    CASE
      WHEN i.in_stock > op.max_stock_level THEN i.in_stock - op.max_stock_level
      ELSE 0
    END as suggested_reduction
  FROM inventory_items i
  JOIN categories c ON i.category_id = c.id
  JOIN suppliers s ON i.supplier_id = s.id
  JOIN inventory_optimization_parameters op ON i.id = op.item_id
  ORDER BY 
    CASE 
      WHEN i.in_stock <= op.reorder_point THEN 1
      WHEN i.in_stock <= op.reorder_point * 1.2 THEN 2
      WHEN i.in_stock > op.max_stock_level THEN 3
      ELSE 4
    END,
    (i.in_stock * i.cost) DESC;
`;

    await pool.query(optimizationRecommendationsView);
  };

  // Create demand volatility analysis
  const createDemandVolatilityAnalysis = async () => {
    console.log('Creating demand volatility analysis...');

    // Create table for demand volatility metrics
    const createDemandVolatilityTable = `
    CREATE TABLE IF NOT EXISTS demand_volatility_metrics (
      id SERIAL PRIMARY KEY,
      item_id INTEGER REFERENCES inventory_items(id),
      category_id INTEGER REFERENCES categories(id),
      coefficient_of_variation FLOAT,
      mean_absolute_deviation FLOAT,
      demand_spikiness FLOAT,
      demand_intermittency FLOAT,
      lumpy_demand_score FLOAT,
      forecast_accuracy FLOAT,
      demand_pattern VARCHAR(20),
      data_quality_score FLOAT,
      recommended_forecasting_method VARCHAR(30),
      measurement_date DATE DEFAULT CURRENT_DATE
    );
  `;

    await pool.query(createDemandVolatilityTable);

    // Get daily demand data for all items over the past 90 days
    const dailyDemandData = await pool.query(`
    SELECT 
      i.id as item_id,
      i.category_id,
      DATE_TRUNC('day', t.transaction_date) as date,
      COALESCE(SUM(-t.quantity) FILTER (WHERE t.transaction_type = 'SALE'), 0) as daily_demand
    FROM inventory_items i
    LEFT JOIN inventory_transactions t ON i.id = t.item_id 
      AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
      AND t.transaction_type = 'SALE'
    GROUP BY i.id, i.category_id, DATE_TRUNC('day', t.transaction_date)
    ORDER BY i.id, date
  `);

    // Group daily demand by item_id
    const demandByItem = {};
    dailyDemandData.rows.forEach(row => {
      if (!demandByItem[row.item_id]) {
        demandByItem[row.item_id] = {
          category_id: row.category_id,
          demands: []
        };
      }
      demandByItem[row.item_id].demands.push(parseFloat(row.daily_demand || 0));
    });

    // Calculate volatility metrics for each item
    const volatilityMetricsToInsert = [];

    for (const itemId in demandByItem) {
      const itemData = demandByItem[itemId];
      const demands = itemData.demands;

      // Skip items with no demand data
      if (demands.length === 0) continue;

      // Calculate basic statistics
      const sum = demands.reduce((acc, val) => acc + val, 0);
      const mean = sum / demands.length;

      // Calculate standard deviation
      const squaredDiffs = demands.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / demands.length;
      const stdDev = Math.sqrt(variance);

      // Calculate coefficient of variation (standard measure of demand volatility)
      const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

      // Calculate mean absolute deviation
      const absoluteDeviations = demands.map(val => Math.abs(val - mean));
      const meanAbsoluteDeviation = absoluteDeviations.reduce((acc, val) => acc + val, 0) / demands.length;

      // Calculate demand spikiness (measure of outliers)
      const maxDemand = Math.max(...demands);
      const demandSpikiness = mean > 0 ? maxDemand / mean : 0;

      // Calculate demand intermittency (proportion of periods with zero demand)
      const zeroCount = demands.filter(val => val === 0).length;
      const demandIntermittency = zeroCount / demands.length;

      // Calculate lumpy demand score (combination of intermittency and variation)
      const lumpyDemandScore = coefficientOfVariation * demandIntermittency;

      // Calculate forecast accuracy assuming a simple moving average forecast
      // (Create synthetic forecasts and compare to actuals)
      let sumSquaredErrors = 0;
      let sumAbsoluteErrors = 0;
      let count = 0;

      for (let i = 7; i < demands.length; i++) {
        // Simple 7-day moving average forecast
        const forecast = demands.slice(i - 7, i).reduce((acc, val) => acc + val, 0) / 7;
        const actual = demands[i];
        const error = actual - forecast;

        sumSquaredErrors += error * error;
        sumAbsoluteErrors += Math.abs(error);
        count++;
      }

      // Calculate MAPE (Mean Absolute Percentage Error) or similar for forecast accuracy
      const mapeInverse = count > 0 ? 1 - (sumAbsoluteErrors / (count * (mean || 1))) : 0;
      const forecastAccuracy = Math.max(0, Math.min(1, mapeInverse)); // Bound between 0 and 1

      // Determine demand pattern based on metrics
      let demandPattern;
      if (demandIntermittency > 0.7) {
        if (coefficientOfVariation > 1) {
          demandPattern = 'LUMPY';
        } else {
          demandPattern = 'INTERMITTENT';
        }
      } else if (coefficientOfVariation > 1) {
        demandPattern = 'ERRATIC';
      } else {
        demandPattern = 'SMOOTH';
      }

      // Determine best forecasting method based on demand pattern
      let recommendedForecastingMethod;
      switch (demandPattern) {
        case 'LUMPY':
          recommendedForecastingMethod = 'CROSTON';
          break;
        case 'INTERMITTENT':
          recommendedForecastingMethod = 'SBA';  // Syntetos-Boylan Approximation
          break;
        case 'ERRATIC':
          recommendedForecastingMethod = 'EXPONENTIAL_SMOOTHING';
          break;
        case 'SMOOTH':
          recommendedForecastingMethod = 'MOVING_AVERAGE';
          break;
        default:
          recommendedForecastingMethod = 'SIMPLE_AVERAGE';
      }

      // Calculate data quality score (higher is better)
      const dataQualityScore = Math.min(1, 0.5 + (demands.length / 90) * 0.5);

      volatilityMetricsToInsert.push({
        item_id: parseInt(itemId),
        category_id: itemData.category_id,
        coefficient_of_variation: Math.round(coefficientOfVariation * 100) / 100,
        mean_absolute_deviation: Math.round(meanAbsoluteDeviation * 100) / 100,
        demand_spikiness: Math.round(demandSpikiness * 100) / 100,
        demand_intermittency: Math.round(demandIntermittency * 100) / 100,
        lumpy_demand_score: Math.round(lumpyDemandScore * 100) / 100,
        forecast_accuracy: Math.round(forecastAccuracy * 100) / 100,
        demand_pattern: demandPattern,
        data_quality_score: Math.round(dataQualityScore * 100) / 100,
        recommended_forecasting_method: recommendedForecastingMethod
      });
    }

    // Batch insert volatility metrics
    for (let i = 0; i < volatilityMetricsToInsert.length; i += batchSize) {
      const batch = volatilityMetricsToInsert.slice(i, i + batchSize);
      const queryText = `
      INSERT INTO demand_volatility_metrics 
      (item_id, category_id, coefficient_of_variation, mean_absolute_deviation, demand_spikiness,
       demand_intermittency, lumpy_demand_score, forecast_accuracy, demand_pattern, data_quality_score, recommended_forecasting_method)
      VALUES 
      ${batch.map((_, j) => `($${j * 11 + 1}, $${j * 11 + 2}, $${j * 11 + 3}, $${j * 11 + 4}, $${j * 11 + 5}, 
                          $${j * 11 + 6}, $${j * 11 + 7}, $${j * 11 + 8}, $${j * 11 + 9}, $${j * 11 + 10}, $${j * 11 + 11})`).join(', ')}
    `;

      const queryParams = batch.flatMap(m => [
        m.item_id, m.category_id, m.coefficient_of_variation, m.mean_absolute_deviation, m.demand_spikiness,
        m.demand_intermittency, m.lumpy_demand_score, m.forecast_accuracy, m.demand_pattern, m.data_quality_score, m.recommended_forecasting_method
      ]);

      await pool.query(queryText, queryParams);
    }

    console.log(`Created demand volatility metrics for ${volatilityMetricsToInsert.length} items.`);

    // Create view for demand volatility summary by category
    const volatilitySummaryView = `
    CREATE OR REPLACE VIEW demand_volatility_summary AS
    SELECT
      c.name as category_name,
      COUNT(dvm.id) as item_count,
      AVG(dvm.coefficient_of_variation) as avg_coefficient_of_variation,
      AVG(dvm.forecast_accuracy) as avg_forecast_accuracy,
      COUNT(CASE WHEN dvm.demand_pattern = 'SMOOTH' THEN 1 END) as smooth_items,
      COUNT(CASE WHEN dvm.demand_pattern = 'ERRATIC' THEN 1 END) as erratic_items,
      COUNT(CASE WHEN dvm.demand_pattern = 'INTERMITTENT' THEN 1 END) as intermittent_items,
      COUNT(CASE WHEN dvm.demand_pattern = 'LUMPY' THEN 1 END) as lumpy_items,
      ROUND(AVG(dvm.data_quality_score) * 100) as avg_data_quality_percentage
    FROM demand_volatility_metrics dvm
    JOIN categories c ON dvm.category_id = c.id
    GROUP BY c.name
    ORDER BY avg_coefficient_of_variation DESC;
  `;

    await pool.query(volatilitySummaryView);
  };

  // Create inventory planning scenerios
  const createInventoryPlanningScenarios = async () => {
    console.log('Creating inventory planning scenarios...');
    const createScenarioItemsTable = `
    CREATE TABLE IF NOT EXISTS inventory_planning_scenario_items (
      id SERIAL PRIMARY KEY,
      scenario_id INTEGER REFERENCES inventory_planning_scenarios(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES inventory_items(id),
      category_id INTEGER REFERENCES categories(id),
      adjusted_safety_stock INTEGER,
      adjusted_reorder_point INTEGER,
      adjusted_order_quantity INTEGER,
      projected_stockouts INTEGER,
      projected_inventory_value DECIMAL(12, 2),
      projected_service_level FLOAT,
      projected_inventory_turns FLOAT,
      notes TEXT
    );
  `;
    await pool.query(createScenarioItemsTable);

    console.log('Scenario items table created.');
    // Insert baseline scenario
    const baselineScenario = `
INSERT INTO inventory_planning_scenarios
(scenario_name, scenario_type, description, target_service_level, is_active)
VALUES 
('Current State Baseline', 'BASELINE', 'Current inventory parameters with no adjustments', 0.95, TRUE);
`;

    await pool.query(baselineScenario);

    // Get the ID of the inserted baseline scenario
    const baselineScenarioResult = await pool.query(`SELECT id FROM inventory_planning_scenarios WHERE scenario_name = 'Current State Baseline'`);
    const baselineScenarioId = baselineScenarioResult.rows[0].id;

    // Insert baseline scenario items based on current optimization parameters
    const baselineScenarioItems = `
INSERT INTO inventory_planning_scenario_items
(scenario_id, item_id, category_id, adjusted_safety_stock, adjusted_reorder_point, adjusted_order_quantity, 
 projected_stockouts, projected_inventory_value, projected_service_level, projected_inventory_turns)
SELECT 
  ${baselineScenarioId} as scenario_id,
  i.id as item_id,
  i.category_id,
  op.safety_stock as adjusted_safety_stock,
  op.reorder_point as adjusted_reorder_point,
  op.economic_order_quantity as adjusted_order_quantity,
  COALESCE(dvm.demand_intermittency * 90, 0) as projected_stockouts,
  (i.in_stock * i.cost) as projected_inventory_value,
  COALESCE(ipm.service_level_percentage / 100, 0.95) as projected_service_level,
  CASE 
    WHEN i.in_stock > 0 THEN
      (SELECT COALESCE(SUM(-quantity), 0) FROM inventory_transactions 
       WHERE item_id = i.id AND transaction_type = 'SALE' AND transaction_date >= CURRENT_DATE - INTERVAL '90 days') / i.in_stock
    ELSE 0
  END as projected_inventory_turns
FROM inventory_items i
JOIN inventory_optimization_parameters op ON i.id = op.item_id
LEFT JOIN demand_volatility_metrics dvm ON i.id = dvm.item_id
LEFT JOIN inventory_performance_metrics ipm ON i.id = ipm.item_id AND ipm.measurement_date = (
  SELECT MAX(measurement_date) FROM inventory_performance_metrics WHERE item_id = i.id
);
`;

    await pool.query(baselineScenarioItems);

    // Insert alternate scenarios
    const alternateScenarios = [
      {
        name: 'High Service Level',
        type: 'SERVICE_LEVEL',
        description: 'Increased safety stock to achieve 98% service level',
        serviceLevel: 0.98,
        safetyStockAdjustment: 1.5,
        leadTimeAdjustment: 1.0,
        demandAdjustment: 1.0,
        costAdjustment: 1.0,
        notes: 'Focus on customer satisfaction at the expense of higher inventory costs'
      },
      {
        name: 'Cost Reduction',
        type: 'COST_OPTIMIZATION',
        description: 'Reduced safety stock and optimized order quantities to minimize holding costs',
        serviceLevel: 0.9,
        safetyStockAdjustment: 0.7,
        leadTimeAdjustment: 1.0,
        demandAdjustment: 1.0,
        costAdjustment: 0.9,
        notes: 'Focus on reducing carrying costs while maintaining acceptable service levels'
      },
      {
        name: 'Peak Season Preparation',
        type: 'SEASONAL',
        description: 'Increased stock levels in preparation for peak seasonal demand',
        serviceLevel: 0.97,
        safetyStockAdjustment: 1.3,
        leadTimeAdjustment: 1.2,
        demandAdjustment: 1.4,
        costAdjustment: 1.0,
        notes: 'Prepare for 40% higher demand during peak season'
      },
      {
        name: 'Supply Chain Disruption',
        type: 'RISK_MITIGATION',
        description: 'Scenario planning for potential supplier disruptions',
        serviceLevel: 0.95,
        safetyStockAdjustment: 1.5,
        leadTimeAdjustment: 2.0,
        demandAdjustment: 1.0,
        costAdjustment: 1.1,
        notes: 'Assumes lead times double due to shipping/manufacturing disruptions'
      }
    ];

    // Insert alternate scenarios and their items
    for (const scenario of alternateScenarios) {
      const scenarioInsert = `
  INSERT INTO inventory_planning_scenarios
  (scenario_name, scenario_type, description, target_service_level, safety_stock_adjustment, 
   lead_time_adjustment, demand_adjustment, cost_adjustment, scenario_notes)
  VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id;
`;

      const scenarioResult = await pool.query(scenarioInsert, [
        scenario.name,
        scenario.type,
        scenario.description,
        scenario.serviceLevel,
        scenario.safetyStockAdjustment,
        scenario.leadTimeAdjustment,
        scenario.demandAdjustment,
        scenario.costAdjustment,
        scenario.notes
      ]);

      const scenarioId = scenarioResult.rows[0].id;

      // Insert adjusted scenario items
      const scenarioItems = `
  INSERT INTO inventory_planning_scenario_items
  (scenario_id, item_id, category_id, adjusted_safety_stock, adjusted_reorder_point, adjusted_order_quantity, 
   projected_stockouts, projected_inventory_value, projected_service_level, projected_inventory_turns)
  SELECT 
    ${scenarioId} as scenario_id,
    i.id as item_id,
    i.category_id,
    CEIL(op.safety_stock * ${scenario.safetyStockAdjustment}) as adjusted_safety_stock,
    CEIL(op.reorder_point * ${scenario.safetyStockAdjustment} * ${scenario.demandAdjustment}) as adjusted_reorder_point,
    CEIL(op.economic_order_quantity * ${scenario.demandAdjustment}) as adjusted_order_quantity,
    CEIL(COALESCE(dvm.demand_intermittency * 90, 0) * (2 - ${scenario.serviceLevel} * 2)) as projected_stockouts,
    (i.in_stock * i.cost * ${scenario.costAdjustment}) as projected_inventory_value,
    ${scenario.serviceLevel} as projected_service_level,
    CASE 
      WHEN i.in_stock > 0 THEN
        ((SELECT COALESCE(SUM(-quantity), 0) FROM inventory_transactions 
         WHERE item_id = i.id AND transaction_type = 'SALE' AND transaction_date >= CURRENT_DATE - INTERVAL '90 days')
         * ${scenario.demandAdjustment}) / (i.in_stock * ${scenario.safetyStockAdjustment})
      ELSE 0
    END as projected_inventory_turns
  FROM inventory_items i
  JOIN inventory_optimization_parameters op ON i.id = op.item_id
  LEFT JOIN demand_volatility_metrics dvm ON i.id = dvm.item_id;
`;

      await pool.query(scenarioItems);
    }

    console.log(`Created inventory planning scenarios with items.`);
  };

  const seedDatabase = async () => {
    try {
      console.log("Starting database seeding process...");

      await createTables();
      console.log("Tables created successfully");

      await generateCategories();
      console.log("Categories generated successfully");

      await generateSuppliers();
      console.log("Suppliers generated successfully");

      await generateInventoryItems();
      console.log("Inventory items generated successfully");

      await generateTransactionHistory();
      console.log("Transaction history generated successfully");

      await generatePurchaseOrders();
      console.log("Purchase orders generated successfully");

      await updateInventoryLevels();
      console.log("Inventory levels updated based on transactions");

      await generateForecastingData();
      console.log("Forecasting data generated successfully");

      await generateInventoryPerformanceMetrics();
      console.log("Inventory performance metrics generated");

      await addInventoryOptimizationParameters();
      console.log("Inventory optimization parameters added");

      await createDemandVolatilityAnalysis();
      console.log("Demand volatility analysis created");

      await createInventoryPlanningScenarios();
      console.log("Inventory planning scenarios created");

      console.log("Database seeding completed successfully!");
    } catch (error) {
      console.error("Error during database seeding:", error);
    } finally {
      await pool.end(); // Close database connection
      console.log("Database connection closed.");
    }
  };
  seedDatabase()
    .then(() => {
      console.log("Seeding process finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });}
