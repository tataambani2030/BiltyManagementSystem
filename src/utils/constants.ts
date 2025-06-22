export const USER_ROLES = {
  ADMIN: 'Admin',
  DISPATCHER: 'Dispatcher',
  ENTRY_OPERATOR: 'Entry Operator',
  ACCOUNTANT: 'Accountant',
} as const;

export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['all'],
  [USER_ROLES.DISPATCHER]: ['bilty', 'vehicle', 'schedule', 'dashboard'],
  [USER_ROLES.ENTRY_OPERATOR]: ['bilty', 'seller', 'supplier'],
  [USER_ROLES.ACCOUNTANT]: ['billing', 'dashboard', 'reports'],
};

export const BILTY_STATUS = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
} as const;

export const VEHICLE_STATUS = {
  ACTIVE: 'Active',
  IDLE: 'Idle',
  MAINTENANCE: 'Maintenance',
} as const;

export const SHIFTS = {
  MORNING: 'Morning',
  EVENING: 'Evening',
} as const;

export const BILLING_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
} as const;