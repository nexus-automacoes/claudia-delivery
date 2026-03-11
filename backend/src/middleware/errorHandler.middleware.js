const errorHandler = (err, req, res, _next) => {
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle Prisma errors
  if (err.code) {
    // P2002 - Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'campo';
      return res.status(409).json({
        status: 409,
        error: 'Registro duplicado',
        message: `Ja existe um registro com este valor para: ${field}`,
      });
    }

    // P2025 - Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 404,
        error: 'Registro nao encontrado',
        message: err.meta?.cause || 'O registro solicitado nao foi encontrado.',
      });
    }

    // P2003 - Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        status: 400,
        error: 'Referencia invalida',
        message: 'O registro referenciado nao existe.',
      });
    }

    // P2014 - Required relation violation
    if (err.code === 'P2014') {
      return res.status(400).json({
        status: 400,
        error: 'Violacao de relacao',
        message: 'A operacao viola uma relacao obrigatoria entre registros.',
      });
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 400,
      error: 'Erro de validacao',
      message: err.message,
    });
  }

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 400,
      error: 'JSON invalido',
      message: 'O corpo da requisicao contem JSON invalido.',
    });
  }

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message = status === 500
    ? 'Erro interno do servidor'
    : err.message || 'Ocorreu um erro inesperado';

  return res.status(status).json({
    status,
    error: err.error || 'Erro',
    message,
  });
};

module.exports = errorHandler;
