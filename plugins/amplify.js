import { Amplify } from '@aws-amplify/core'

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.userPoolId,
    userPoolWebClientId: process.env.userPoolWebClientId
  }
})
