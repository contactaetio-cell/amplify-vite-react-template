import { defineAuth, secret} from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET')
      },
      callbackUrls: [
        'https://main.d27ng47b6pfw44.amplifyapp.com/dashboard',
      ],
      logoutUrls: ['https://main.d27ng47b6pfw44.amplifyapp.com/']
    }
  },
  
});
