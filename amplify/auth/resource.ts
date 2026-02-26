import { defineAuth, secret } from '@aws-amplify/backend';

declare const process: {
  env: Record<string, string | undefined>;
};

const samlProviderName = process.env.SAML_PROVIDER_NAME ?? 'AetioSAML';
const samlMetadataUrl = process.env.SAML_METADATA_URL;

const callbackUrls = [
  'https://main.d27ng47b6pfw44.amplifyapp.com/dashboard',
];

const logoutUrls = [
  'https://main.d27ng47b6pfw44.amplifyapp.com/',
];

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
      },
      ...(samlMetadataUrl
        ? {
            saml: {
              name: samlProviderName,
              metadata: {
                metadataType: 'URL',
                metadataContent: samlMetadataUrl,
              },
            },
          }
        : {}),
      callbackUrls,
      logoutUrls,
    },
  },
});
