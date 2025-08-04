import { companyHandlers } from './companies';
import { groupHandlers } from './groups';
import { recentSearchHandlers } from './recentSearches';
import { authHandlers } from './auth';

export const handlers = [
  ...companyHandlers,
  ...groupHandlers,
  ...recentSearchHandlers,
  ...authHandlers,
];

export default handlers;