import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        signUpVerificationMethod: 'code',
      }
    },
    Storage: {
      S3: {
        region: 'ap-southeast-2', // Sydney region
        bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
      }
    }
  }, {
    ssr: true
  });
}