const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'dateRange', 'search', 'sortBy'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let baseQuery = JSON.parse(queryStr);

  // Add user filter to only get resources for the logged in user
  if (model.modelName === 'Transaction') {
    baseQuery.user = req.user.id;
    
    // Handle date range filtering
    if (req.query.dateRange) {
      const now = new Date();
      let startDate, endDate = now;
      
      switch (req.query.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
          break;
        case 'last7':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'thismonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastmonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
      }
      
      if (startDate) {
        baseQuery.date = { $gte: startDate, $lte: endDate };
      }
    }
    
    // Handle search functionality
    if (req.query.search) {
      baseQuery.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }
  }

  query = model.find(baseQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort - handle both sort and sortBy parameters
  if (req.query.sortBy) {
    let sortField;
    switch (req.query.sortBy) {
      case 'date_desc':
        sortField = '-date';
        break;
      case 'date_asc':
        sortField = 'date';
        break;
      case 'amount_desc':
        sortField = '-amount';
        break;
      case 'amount_asc':
        sortField = 'amount';
        break;
      case 'category_asc':
        sortField = 'category';
        break;
      default:
        sortField = '-date';
    }
    query = query.sort(sortField);
  } else if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-date');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(baseQuery);

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: {
      transactions: results,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  };

  next();
};

module.exports = advancedResults;
