export const validateRequest = (schema, target = 'body') => {
  return async (req, res, next) => {
    let dataToValidate;

    switch (target) {
    case 'query':
      dataToValidate = req.query;
      break;
    case 'params':
      dataToValidate = req.params;
      break;
    case 'body':
    default:
      dataToValidate = req.body;
      break;
    }

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        statusCode: 400,
        request: {
          ip: req.ip || null,
          method: req.method,
          url: req.originalUrl,
        },
        message: errors[0]?.message || 'Validation failed',
        errors,
      });
    }

    switch (target) {
    case 'query':
      Object.assign(req.query, result.data);
      break;
    case 'params':
      Object.assign(req.params, result.data);
      break;
    case 'body':
    default:
      Object.assign(req.body, result.data);
      break;
    }

    return next();
  };
};

export default validateRequest;
