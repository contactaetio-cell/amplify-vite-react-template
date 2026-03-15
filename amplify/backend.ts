import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { sayHello } from './functions/say-hello/resource';
import { data } from './data/resource';
defineBackend({ 
  auth,
  data,
  storage,
  sayHello
});
