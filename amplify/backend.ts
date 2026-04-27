import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({ 
  auth,
  storage
});

backend.storage.resources.cfnResources.cfnBucket.corsConfiguration = {
  corsRules: [
    {
      allowedOrigins: ['http://localhost:5001', 'http://localhost:5173'],
      allowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
      allowedHeaders: ['*'],
      exposedHeaders: ['ETag', 'x-amz-request-id', 'x-amz-id-2'],
      maxAge: 3000,
    },
  ],
};

