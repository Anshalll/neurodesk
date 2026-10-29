class AppError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class UserNotFound(AppError):
    def __init__(self, message="User not found"):
        super().__init__(message, status_code=404)


class InvalidCredentials(AppError):
    def __init__(self, message="Invalid email or password"):
        super().__init__(message, status_code=401)


class UserAlreadyExists(AppError):
    def __init__(self, message="User with this email already exists"):
        super().__init__(message, status_code=409)


class ValidationError(AppError):
    def __init__(self, message="Invalid input data"):
        super().__init__(message, status_code=422)


class TokenExpiredOrInvalid(AppError):
    def __init__(self, message="Code or token has expired or is invalid"):
        super().__init__(message, status_code=400)
