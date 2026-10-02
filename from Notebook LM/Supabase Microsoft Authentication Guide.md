# Supabase Microsoft Authentication Guide

Sign in with Azure (Microsoft) | Supabase Docs

Skip to content

https://supabase.com/docs/guides/auth/social-login/auth-azure#docs-content-container

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

https://supabase.com/docs/guides/getting-started

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

Search docs...

https://supabase.com/dashboard

https://supabase.com/docs/guides/auth

https://supabase.com/docs/guides/auth

Architecture

https://supabase.com/docs/guides/auth/architecture

Getting Started

https://supabase.com/docs/guides/auth/quickstarts/nextjs

https://supabase.com/docs/guides/auth/quickstarts/astrojs

https://supabase.com/docs/guides/auth/quickstarts/react

React Native

https://supabase.com/docs/guides/auth/quickstarts/react-native

React Native with Expo & Social Auth

https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth

https://supabase.com/docs/guides/auth/users

https://supabase.com/docs/guides/auth/identities

Flows (How-tos)

Which package to use

https://supabase.com/docs/guides/auth/choosing-a-server-package

Server-Side Rendering

Password-based

https://supabase.com/docs/guides/auth/passwords

Email (Magic link or OTP)

https://supabase.com/docs/guides/auth/auth-email-passwordless

Phone Login

https://supabase.com/docs/guides/auth/phone-login

https://supabase.com/docs/guides/auth/passkeys

Social Login (OAuth)

https://supabase.com/docs/guides/auth/social-login

https://supabase.com/docs/guides/auth/social-login/auth-google

https://supabase.com/docs/guides/auth/social-login/auth-facebook

https://supabase.com/docs/guides/auth/social-login/auth-apple

Azure (Microsoft)

https://supabase.com/docs/guides/auth/social-login/auth-azure

https://supabase.com/docs/guides/auth/social-login/auth-twitter

https://supabase.com/docs/guides/auth/social-login/auth-github

https://supabase.com/docs/guides/auth/social-login/auth-gitlab

https://supabase.com/docs/guides/auth/social-login/auth-bitbucket

https://supabase.com/docs/guides/auth/social-login/auth-discord

https://supabase.com/docs/guides/auth/social-login/auth-figma

https://supabase.com/docs/guides/auth/social-login/auth-kakao

https://supabase.com/docs/guides/auth/social-login/auth-keycloak

https://supabase.com/docs/guides/auth/social-login/auth-linkedin

https://supabase.com/docs/guides/auth/social-login/auth-notion

https://supabase.com/docs/guides/auth/social-login/auth-slack

https://supabase.com/docs/guides/auth/social-login/auth-spotify

https://supabase.com/docs/guides/auth/social-login/auth-twitch

https://supabase.com/docs/guides/auth/social-login/auth-workos

https://supabase.com/docs/guides/auth/social-login/auth-zoom

Enterprise SSO

Custom OAuth/OIDC Providers

https://supabase.com/docs/guides/auth/custom-oauth-providers

Anonymous Sign-Ins

https://supabase.com/docs/guides/auth/auth-anonymous

Web3 (Ethereum or Solana)

https://supabase.com/docs/guides/auth/auth-web3

Mobile Deep Linking

https://supabase.com/docs/guides/auth/native-mobile-deep-linking

Identity Linking

https://supabase.com/docs/guides/auth/auth-identity-linking

Multi-Factor Authentication

https://supabase.com/docs/guides/auth/signout

Error Codes

https://supabase.com/docs/guides/auth/debugging/error-codes

Troubleshooting

https://supabase.com/docs/guides/auth/troubleshooting

OAuth 2.1 Server

https://supabase.com/docs/guides/auth/oauth-server

Getting Started

https://supabase.com/docs/guides/auth/oauth-server/getting-started

OAuth Flows

https://supabase.com/docs/guides/auth/oauth-server/oauth-flows

MCP Authentication

https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication

Token Security & RLS

https://supabase.com/docs/guides/auth/oauth-server/token-security

Third-party auth

https://supabase.com/docs/guides/auth/third-party/overview

https://supabase.com/docs/guides/auth/third-party/clerk

Firebase Auth

https://supabase.com/docs/guides/auth/third-party/firebase-auth

https://supabase.com/docs/guides/auth/third-party/auth0

AWS Cognito (Amplify)

https://supabase.com/docs/guides/auth/third-party/aws-cognito

https://supabase.com/docs/guides/auth/third-party/workos

Configuration

General Configuration

https://supabase.com/docs/guides/auth/general-configuration

Email Templates

https://supabase.com/docs/guides/auth/auth-email-templates

Redirect URLs

https://supabase.com/docs/guides/auth/redirect-urls

Custom SMTP

https://supabase.com/docs/guides/auth/auth-smtp

User Management

https://supabase.com/docs/guides/auth/managing-user-data

Password Security

https://supabase.com/docs/guides/auth/password-security

Rate Limits

https://supabase.com/docs/guides/auth/rate-limits

Bot Detection (CAPTCHA)

https://supabase.com/docs/guides/auth/auth-captcha

https://supabase.com/docs/guides/auth/audit-logs

JSON Web Tokens (JWT)

JWT Signing Keys

https://supabase.com/docs/guides/auth/signing-keys

Row Level Security

https://supabase.com/docs/guides/database/postgres/row-level-security

Column Level Security

https://supabase.com/docs/guides/database/postgres/column-level-security

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

https://supabase.com/docs/guides/getting-started

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

Search docs...

https://supabase.com/dashboard

https://supabase.com/docs/guides/auth

Flows (How-tos)

Social Login (OAuth)

https://supabase.com/docs/guides/auth/social-login

Sign in with Azure (Microsoft)

To enable Azure (Microsoft) Auth for your project, you need to set up an Azure OAuth application and add the application credentials to your Supabase Dashboard.

https://supabase.com/docs/guides/auth/social-login/auth-azure#overview

#### Setting up OAuth with Azure consists of four broad steps:

Create an OAuth application under Azure Entra ID.

Add a secret to the application.

Add the Supabase Auth callback URL to the allowlist in the OAuth application in Azure.

Configure the client ID and secret of the OAuth application within the Supabase Auth dashboard.

Access your Azure Developer account

https://supabase.com/docs/guides/auth/social-login/auth-azure#access-your-azure-developer-account

portal.azure.com

https://portal.azure.com/#home

Sign in and select Microsoft Entra ID under the list of Azure Services.

Register an application

https://supabase.com/docs/guides/auth/social-login/auth-azure#register-an-application

Under Microsoft Entra ID, select

App registrations

in the side panel and select

New registration.

Choose a name and select your preferred option for the supported account types.

Redirect URI

. It should look like this:

https://<project-ref>.supabase.co/auth/v1/callback

Finally, select

at the bottom of the screen.

Obtain a client ID and secret

https://supabase.com/docs/guides/auth/social-login/auth-azure#obtain-a-client-id-and-secret

Local development with Azure OAuth

https://supabase.com/docs/guides/auth/social-login/auth-azure#local-development-with-azure-oauth

Azure does not allow

as a redirect URI hostname and requires the use of

To enable Azure OAuth during local Supabase development, configure the Supabase API external URL in your

config.toml

1
\[api\]
2
external\_url = "http://localhost:54321"

Once your app has been registered, the client ID can be found under the

list of app registrations

https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ActiveDirectoryMenuBlade/RegisteredApps

under the column titled

Application (client) ID

You can also find it in the app overview screen.

Place the Client ID in the Azure configuration screen in the Supabase Auth dashboard.

Add a certificate or secret

in the app overview screen and open the

Client secrets

New client secret

to create a new client secret.

Choose a preferred expiry time of the secret. Make sure you record this in your calendar days in advance so you have enough time to create a new one without suffering from any downtime.

Once the secret is generated place the

column (not

) in the Azure configuration screen in the Supabase Auth dashboard.

#### You can also configure the Azure auth provider using the Management API:

1
# Get your access token from https://supabase.com/dashboard/account/tokens
2
export SUPABASE\_ACCESS\_TOKEN="your-access-token"
3
export PROJECT\_REF="your-project-ref"
4
5
# Configure Azure auth provider
6
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT\_REF/config/auth" \
7
  -H "Authorization: Bearer $SUPABASE\_ACCESS\_TOKEN" \
8
  -H "Content-Type: application/json" \
9
  -d '{
10
    "external\_azure\_enabled": true,
11
    "external\_azure\_client\_id": "your-azure-client-id",
12
    "external\_azure\_secret": "your-azure-client-secret",
13
    "external\_azure\_url": "your-azure-url"
14
  }'

Guarding against unverified email domains

https://supabase.com/docs/guides/auth/social-login/auth-azure#guarding-against-unverified-email-domains

Microsoft Entra ID can send out unverified email domains in certain cases. This may open up your project to a vulnerability where a malicious user can impersonate already existing accounts on your project.

#### This only applies in at least one of these cases:

You have configured the

authenticationBehaviors

setting of your OAuth application to allow unverified email domains

You are using an OAuth app configured as single-tenant in the supported account types

Your OAuth app was created before June 20th 2023 after Microsoft announced this vulnerability, and the app had used unverified emails prior

This means that most OAuth apps

are not susceptible

to this vulnerability.

Despite this, we recommend configuring the

optional xms\_edov claim

https://learn.microsoft.com/en-us/azure/active-directory/develop/migrate-off-email-claim-authorization#using-the-xms\_edov-optional-claim-to-determine-email-verification-status-and-migrate-users

on the OAuth app. This claim allows Supabase Auth to identify with certainty whether the email address sent over by Microsoft Entra ID is verified or not.

#### Configure this in the following way:

App registrations

menu in Microsoft Entra ID on the Azure portal.

Select the OAuth app.

menu in the sidebar.

Make a backup of the JSON in case you need it later.

Identify the

optionalClaims

#### Edit it by specifying the following object:

1
"optionalClaims": {
2
      "idToken": \[
3
          {
4
              "name": "xms\_edov",
5
              "source": null,
6
              "essential": false,
7
              "additionalProperties": \[\]
8
          },
9
          {
10
              "name": "email",
11
              "source": null,
12
              "essential": false,
13
              "additionalProperties": \[\]
14
          }
15
      \],
16
      "accessToken": \[
17
          {
18
              "name": "xms\_edov",
19
              "source": null,
20
              "essential": false,
21
              "additionalProperties": \[\]
22
          }
23
      \],
24
      "saml2Token": \[\]
25
  },

to apply the new configuration.

Configure a tenant URL (optional)

https://supabase.com/docs/guides/auth/social-login/auth-azure#configure-a-tenant-url-optional

A Microsoft Entra tenant is the directory of users who are allowed to access your project. This section depends on what your OAuth registration uses for

Supported account types.

By default, Supabase Auth uses the

Microsoft tenant (

https://login.microsoftonline.com/common

) which generally allows any Microsoft account to sign in to your project. Microsoft Entra further limits what accounts can access your project depending on the type of OAuth application you registered.

If your app is registered as

Personal Microsoft accounts only

Supported account types

set Microsoft tenant to

https://login.microsoftonline.com/consumers

If your app is registered as

My organization only

Supported account types

you may want to configure Supabase Auth with the organization's tenant URL. This will use the tenant's authorization flows instead, and will limit access at the Supabase Auth level to Microsoft accounts arising from only the specified tenant.

Configure this by storing a value under

Azure Tenant URL

in the Supabase Auth provider configuration page for Azure that has the following format

https://login.microsoftonline.com/<tenant-id>

Add sign-in code to your client app

https://supabase.com/docs/guides/auth/social-login/auth-azure#add-sign-in-code-to-your-client-app

Supabase Auth requires that Azure returns a valid email address. Therefore you must request the

scope in the

signInWithOAuth

JavaScript Flutter Kotlin C#

Make sure you're using the right

client in the following code.

If you're not using Server-Side Rendering or cookie-based Auth, you can directly use the

createClient

@supabase/supabase-js

. If you're using Server-Side Rendering, see the

Server-Side Auth guide

https://supabase.com/docs/guides/auth/server-side/creating-a-client

for instructions on creating your Supabase client.

When your user signs in, call

signInWithOAuth()

https://supabase.com/docs/reference/javascript/auth-signinwithoauth

1
async function signInWithAzure() {
2
  const { data, error } = await supabase.auth.signInWithOAuth({
3
    provider: 'azure',
4
    options: {
5
      scopes: 'email',
6
    },
7
  })
8
}

For a PKCE flow, for example in Server-Side Auth, you need an extra step to handle the code exchange. When calling

signInWithOAuth

, provide a

URL which points to a callback route. This redirect URL should be added to your

redirect allow list

https://supabase.com/docs/guides/auth/redirect-urls

Client Server

In the browser,

signInWithOAuth

automatically redirects to the OAuth provider's authentication endpoint, which then redirects to your endpoint.

1
await supabase.auth.signInWithOAuth({
2
  provider,
3
  options: {
4
    redirectTo: \`http://example.com/auth/callback\`,
5
  },
6
})

At the callback endpoint, handle the code exchange to save the user session.

Next.js SvelteKit Astro Remix Express

Create a new file at

app/auth/callback/route.ts

and populate with the following:

app/auth/callback/route.ts

1
import { NextResponse } from 'next/server'
2
3
// The client you created from the Server-Side Auth instructions
4
import { createClient } from '@/utils/supabase/server'
5
6
export async function GET(request: Request) {
7
  const { searchParams, origin } = new URL(request.url)
8
  const code = searchParams.get('code')
9
  // if "next" is in param, use it as the redirect URL
10
  let next = searchParams.get('next') ?? '/'
11
  if (!next.startsWith('/')) {
12
    // if "next" is not a relative URL, use the default
13
    next = '/'
14
  }
15
16
  if (code) {
17
    const supabase = await createClient()
18
    const { error } = await supabase.auth.exchangeCodeForSession(code)
19
    if (!error) {
20
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
21
      const isLocalEnv = process.env.NODE\_ENV === 'development'
22
      if (isLocalEnv) {
23
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
24
        return NextResponse.redirect(\`${origin}${next}\`)
25
      } else if (forwardedHost) {
26
        return NextResponse.redirect(\`https://${forwardedHost}${next}\`)
27
      } else {
28
        return NextResponse.redirect(\`${origin}${next}\`)
29
      }
30
    }
31
  }
32
33
  // return the user to an error page with instructions
34
  return NextResponse.redirect(\`${origin}/auth/auth-code-error\`)
35
}

JavaScript Flutter Kotlin C#

When your user signs out, call

https://supabase.com/docs/reference/javascript/auth-signout

to remove them from the browser session and any objects from localStorage:

1
async function signOut() {
2
  const { error } = await supabase.auth.signOut()
3
}

Obtain the provider refresh token

https://supabase.com/docs/guides/auth/social-login/auth-azure#obtain-the-provider-refresh-token

Azure OAuth2.0 doesn't return the

provider\_refresh\_token

by default. If you need the

provider\_refresh\_token

returned, you will need to include the following scope:

JavaScript Flutter Kotlin C#

1
async function signInWithAzure() {
2
  const { data, error } = await supabase.auth.signInWithOAuth({
3
    provider: 'azure',
4
    options: {
5
      scopes: 'offline\_access',
6
    },
7
  })
8
}

https://supabase.com/docs/guides/auth/social-login/auth-azure#resources

Azure Developer Account

https://portal.azure.com/

GitHub Discussion

https://github.com/supabase/gotrue/pull/54#issuecomment-757043573

Potential Risk of Privilege Escalation in Azure AD Applications

https://msrc.microsoft.com/blog/2023/06/potential-risk-of-privilege-escalation-in-azure-ad-applications/

Edit this page on GitHub

https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/social-login/auth-azure.mdx

Is this helpful?

Connect your AI agent

https://supabase.com/docs/guides/ai-tools

Copy as Markdown

Ask ChatGPT

https://chatgpt.com/?hint=search&q=Read%20from%20https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fauth%2Fsocial-login%2Fauth-azure%20so%20I%20can%20ask%20questions%20about%20its%20contents

https://claude.ai/new?q=Read%20from%20https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fauth%2Fsocial-login%2Fauth-azure%20so%20I%20can%20ask%20questions%20about%20its%20contents

On this page

https://supabase.com/docs/guides/auth/social-login/auth-azure#overview

Access your Azure Developer account

https://supabase.com/docs/guides/auth/social-login/auth-azure#access-your-azure-developer-account

Register an application

https://supabase.com/docs/guides/auth/social-login/auth-azure#register-an-application

Obtain a client ID and secret

https://supabase.com/docs/guides/auth/social-login/auth-azure#obtain-a-client-id-and-secret

Local development with Azure OAuth

https://supabase.com/docs/guides/auth/social-login/auth-azure#local-development-with-azure-oauth

Guarding against unverified email domains

https://supabase.com/docs/guides/auth/social-login/auth-azure#guarding-against-unverified-email-domains

Configure a tenant URL (optional)

https://supabase.com/docs/guides/auth/social-login/auth-azure#configure-a-tenant-url-optional

Add sign-in code to your client app

https://supabase.com/docs/guides/auth/social-login/auth-azure#add-sign-in-code-to-your-client-app

Obtain the provider refresh token

https://supabase.com/docs/guides/auth/social-login/auth-azure#obtain-the-provider-refresh-token

https://supabase.com/docs/guides/auth/social-login/auth-azure#resources

Need some help?

Contact support

https://supabase.com/support

Latest product updates?

See Changelog

https://supabase.com/changelog

Something's not right?

Check system status

https://status.supabase.com/

© Supabase Inc

https://supabase.com/

Contributing

https://github.com/supabase/supabase/blob/master/apps/docs/DEVELOPERS.md

Author Styleguide

https://github.com/supabase/supabase/blob/master/apps/docs/CONTRIBUTING.md

Open Source

https://supabase.com/open-source

https://supabase.com/supasquad

Privacy Settings

https://twitter.com/supabase

https://github.com/supabase

https://discord.supabase.com/

https://youtube.com/c/supabase

