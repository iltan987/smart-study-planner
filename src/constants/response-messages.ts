export const RESPONSE_MESSAGES_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists with this email',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized',
  USER_NOT_FOUND: 'User not found',
  INVALID_MESSAGE_TYPE: 'Invalid message type',
  INVALID_PASSWORD: 'Invalid current password',
};

export const RESPONSE_MESSAGES_SUCCESS = {
  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SESSION_SUCCESS: 'Session retrieved successfully',
  USER_SUCCESS: 'User retrieved successfully',
  /* Message related responses */
  MESSAGE_SAVED_SUCCESS: 'Message saved successfully',
  MESSAGE_SENT_SUCCESS: 'Message sent successfully',
  MESSAGES_RETRIEVED_SUCCESS: 'Messages retrieved successfully',
  /* Profile related responses */
  PROFILE_RETRIEVED_SUCCESS: 'Profile retrieved successfully',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  MEMORY_CREATED: 'Memory created successfully',
  MEMORY_RETRIEVED: 'Memory retrieved successfully',
  /* Todo related responses */
  TODO_CREATED: 'Todo created successfully',
  TODO_UPDATED: 'Todo updated successfully',
  TODOS_RETRIEVED: 'Todos retrieved successfully',
};

export const RESPONSE_MESSAGES = {
  ...RESPONSE_MESSAGES_ERRORS,
  ...RESPONSE_MESSAGES_SUCCESS,
};
