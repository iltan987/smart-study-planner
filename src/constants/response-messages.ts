export const RESPONSE_MESSAGES_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized',
  USER_NOT_FOUND: 'User not found',
};

export const RESPONSE_MESSAGES_SUCCESS = {
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  UPDATE_SUCCESS: 'User updated successfully',
  SESSION_SUCCESS: 'Session retrieved successfully',
  USER_SUCCESS: 'User retrieved successfully',
  MESSAGE_SUCCESS: 'Message saved successfully',
};

export const RESPONSE_MESSAGES = {
  ...RESPONSE_MESSAGES_ERRORS,
  ...RESPONSE_MESSAGES_SUCCESS,
};
