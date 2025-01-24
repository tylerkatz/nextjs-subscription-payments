// Auth configuration types
interface AuthConfig {
  methods: {
    oauth: boolean;
    email: boolean;
    password: boolean;
  };
  routing: {
    useServerRedirect: boolean;
  };
}

// Main configuration object
const AUTH_CONFIG: AuthConfig = {
  methods: {
    oauth: true,
    email: true,
    password: true
  },
  routing: {
    useServerRedirect: false // Disabled due to screen flicker with server redirects
  }
} as const;

// Validation function
const validateConfig = (config: AuthConfig): void => {
  if (!config.methods.email && !config.methods.password) {
    throw new Error('At least one of email or password authentication must be enabled');
  }
};

// Validate on initialization
validateConfig(AUTH_CONFIG);

// Export helpers
export const getAuthTypes = () => AUTH_CONFIG.methods;
export const getAuthRouting = () => AUTH_CONFIG.routing;
export const isMethodEnabled = (method: keyof AuthConfig['methods']) => 
  AUTH_CONFIG.methods[method];

export const getViewTypes = () => {
  // Define the valid view types
  let viewTypes: string[] = [];
  if (AUTH_CONFIG.methods.email) {
    viewTypes = [...viewTypes, 'email_signin'];
  }
  if (AUTH_CONFIG.methods.password) {
    viewTypes = [
      ...viewTypes,
      'password_signin',
      'forgot_password',
      'update_password',
      'signup'
    ];
  }

  return viewTypes;
};

export const getDefaultSignInView = (preferredSignInView: string | null) => {
  // Define the default sign in view
  let defaultView = AUTH_CONFIG.methods.password ? 'password_signin' : 'email_signin';
  if (preferredSignInView && getViewTypes().includes(preferredSignInView)) {
    defaultView = preferredSignInView;
  }

  return defaultView;
};

export const getRedirectMethod = () => {
  return AUTH_CONFIG.routing.useServerRedirect ? 'server' : 'client';
};
