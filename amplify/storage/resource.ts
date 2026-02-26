import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'aetioInsightStorage',
  access: (allow) => ({
    'uploads/extraction/*': [
      allow.authenticated.to(['read', 'write']),
    ],
  }),
});
