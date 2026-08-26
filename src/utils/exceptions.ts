type Exception = Error & {
  statusCode: number;
};

function createException(statusCode: number, message: string): Exception {
  const error = new Error(message) as Exception;
  error.statusCode = statusCode;
  return error;
}

export const BadRequestException = (message = 'Bad Request'): Exception =>
  createException(400, message);

export const UnauthorizedException = (message = 'Unauthorized'): Exception =>
  createException(401, message);

export const ForbiddenException = (message = 'Forbidden'): Exception =>
  createException(403, message);

export const NotFoundException = (message = 'Resource Not Found'): Exception =>
  createException(404, message);

export const ConflictException = (message = 'Conflict'): Exception =>
  createException(409, message);

export const ValidationException = (message = 'Validation Failed'): Exception =>
  createException(422, message);

export const InternalServerException = (
  message = 'Internal Server Error',
): Exception => createException(500, message);
