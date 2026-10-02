# Supabase API Security Guidance

Securing your API | Supabase Docs

Skip to content

https://supabase.com/docs/guides/api/securing-your-api#docs-content-container

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

https://supabase.com/docs/guides/getting-started

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

Search docs...

https://supabase.com/dashboard

Data REST API

https://supabase.com/docs/guides/api

https://supabase.com/docs/guides/api

https://supabase.com/docs/guides/api/quickstart

Client Libraries

https://supabase.com/docs/guides/api/rest/client-libs

Securing your API

https://supabase.com/docs/guides/api/securing-your-api

Custom Claims & RBAC

https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac

Auto-generated Docs

https://supabase.com/docs/guides/api/rest/auto-generated-docs

SQL to REST API Translator

https://supabase.com/docs/guides/api/sql-to-rest

Creating API routes

https://supabase.com/docs/guides/api/creating-routes

Generating TypeScript Types

https://supabase.com/docs/guides/api/rest/generating-types

Generating Python Types

https://supabase.com/docs/guides/api/rest/generating-python-types

Error Codes

https://supabase.com/docs/guides/api/rest/postgrest-error-codes

Using the Data APIs

Managing tables and data

https://supabase.com/docs/guides/database/tables

https://supabase.com/docs/guides/database/views

Querying joins and nested tables

https://supabase.com/docs/guides/database/joins-and-nesting

JSON and unstructured data

https://supabase.com/docs/guides/database/json

Managing database functions

https://supabase.com/docs/guides/database/functions

Using full-text search

https://supabase.com/docs/guides/database/full-text-search

Debugging performance issues

https://supabase.com/docs/guides/database/debugging-performance

Using custom schemas

https://supabase.com/docs/guides/api/using-custom-schemas

Converting from SQL to JavaScript API

https://supabase.com/docs/guides/api/sql-to-api

Handling Errors in supabase-js

https://supabase.com/docs/guides/api/handling-errors-in-supabase-js

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

https://supabase.com/docs/guides/getting-started

Supabase wordmarkSupabase wordmark DOCS

https://supabase.com/docs

Search docs...

https://supabase.com/dashboard

Data REST API

https://supabase.com/docs/guides/api

https://supabase.com/docs/guides/api

Securing your API

This guide explains how to secure the Data API with Postgres grants, Row Level Security, dedicated schemas, and request checks.

#### Use the guide in two parts:

Understand Data API security

https://supabase.com/docs/guides/api/securing-your-api#understand-data-api-security

explains how the controls work and when to use them.

Configure Data API security

https://supabase.com/docs/guides/api/securing-your-api#configure-data-api-security

groups the procedures for applying those controls.

Read the first section when you need to choose a security approach. Go directly to the second section when you know which controls you need to configure.

Understand Data API security

https://supabase.com/docs/guides/api/securing-your-api#understand-data-api-security

This section provides the context for the procedures later in the guide.

Grants and RLS

https://supabase.com/docs/guides/api/securing-your-api#grants-and-rls

#### The Data API works with two layers of Postgres access control:

determine which Postgres roles can reach a table, view, or function over the Data API. These roles include

authenticated

service\_role

Row Level Security (RLS) policies

determine which rows those roles can read or modify.

Grants control whether a role can access an object. RLS controls which rows the role can access. Use both controls for every exposed object.

To apply these controls, see

Grant access explicitly

https://supabase.com/docs/guides/api/securing-your-api#grant-access-explicitly

Enable RLS policies

https://supabase.com/docs/guides/api/securing-your-api#enable-rls-policies

Default privileges

https://supabase.com/docs/guides/api/securing-your-api#default-privileges

On existing projects, tables created in

privileges for

authenticated

service\_role

by default. Functions receive

. These grants make new objects reachable through the Data API, even when you don't intend to expose them.

Supabase is changing the platform default to revoke these automatic grants so that exposure becomes opt-in. See

the platform defaults discussion

https://github.com/orgs/supabase/discussions/45329

in the Supabase GitHub discussions.

The default privileges are part of the standard Supabase permission model and don't bypass RLS. The internal

supabase\_admin

role grants them to

authenticated

service\_role

, but it can't authenticate through the Data API. See

pg\_default\_acl

https://www.postgresql.org/docs/current/catalog-pg-default-acl.html

in the Postgres documentation and

supabase\_admin

https://supabase.com/docs/guides/database/postgres/roles#supabaseadmin

in the Supabase documentation.

To prevent automatic grants on new objects, see

Revoke default privileges

https://supabase.com/docs/guides/api/securing-your-api#revoke-default-privileges

Dedicated API schemas

https://supabase.com/docs/guides/api/securing-your-api#dedicated-api-schemas

A dedicated schema adds another boundary around your Data API. Objects in a schema such as

define the API surface. Internal tables and helper functions remain in schemas that aren't exposed.

You can control access with grants in any schema. A dedicated schema makes the exposed surface easier to identify and audit. See

Using Custom Schemas

https://supabase.com/docs/guides/api/using-custom-schemas

for setup steps.

Pre-request checks

https://supabase.com/docs/guides/api/securing-your-api#pre-request-checks

RLS policies don't cover every API security requirement. Add pre-request checks for requirements such as:

Enforcing per-IP or per-user rate limits.

Checking custom or additional API keys before allowing further access.

Rejecting requests after exceeding a quota or requiring payment.

Disallowing direct access to certain tables, views, or functions in exposed schemas.

A Postgres pre-request function reads request information and performs these checks before serving a response. For example, the function can count requests or verify an API key.

To add a check, see

Configure a pre-request function

https://supabase.com/docs/guides/api/securing-your-api#configure-a-pre-request-function

pgrst.db\_pre\_request

configuration only works with the

(PostgREST). It does not work with Realtime, Storage, or other Supabase products.

If you're using

db\_pre\_request

to call a function (like

set\_information()

) that sets up context or performs checks on every request, and you need similar behavior for other Supabase products, you must call the function directly in your Row Level Security (RLS) policies instead.

If you have a

db\_pre\_request

function that calls

set\_information()

that returns

to set up context or perform checks, and you have an RLS policy like:

1
create policy "Individuals can view their own todos."
2
on todos for select
3
using ( (select auth.uid()) = user\_id );

To achieve the same behavior with other Supabase products, you need to call the function directly in your RLS policy:

1
create policy "Individuals can view their own todos."
2
on todos for select
3
using ( set\_information() AND (select auth.uid()) = user\_id );

This ensures the function is called when evaluating RLS policies for all products, not only Data API requests.

#### Performance consideration:

Be aware that calling functions directly in RLS policies can impact database performance, as the function is evaluated for each row when the policy is checked. Consider optimizing your function or using caching strategies if performance becomes an issue.

Request information

https://supabase.com/docs/guides/api/securing-your-api#request-information

Use the Postgres

current\_setting()

function to access request information:

1
-- Get all headers sent in the request
2
select current\_setting('request.headers', true)::json;
3
4
-- Get one header with a JSON arrow operator
5
select current\_setting('request.headers', true)::json->>'user-agent';
6
7
-- Get cookies
8
select current\_setting('request.cookies', true)::json;

current\_setting()

Description

request.method

Request's method

request.path

Table's path

request.path

View's path

request.path

rpc/function

Function's path

request.headers

{ "User-Agent": "...", ... }

JSON object of the request's headers

request.cookies

{ "cookieA": "...", "cookieB": "..." }

JSON object of the request's cookies

request.jwt

{ "sub": "a7194ea3-...", ... }

JSON object of the JWT payload

To access the client's IP address, look up the

X-Forwarded-For

header in the

request.headers

1
select split\_part(
2
  current\_setting('request.headers', true)::json->>'x-forwarded-for',
3
  ',', 1); -- takes the client IP before the first comma

Pre-request

https://postgrest.org/en/stable/references/transactions.html#pre-request

in the PostgREST documentation and

X-Forwarded-For

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For

in the MDN documentation.

For complete implementations that use this request information, see

Pre-request examples

https://supabase.com/docs/guides/api/securing-your-api#pre-request-examples

Error responses

https://supabase.com/docs/guides/api/securing-your-api#error-responses

A pre-request function can raise an exception to stop a request. This example returns an HTTP 402 Payment Required response with a

X-Powered-By

1
raise sqlstate 'PGRST' using
2
  message = json\_build\_object(
3
    'code',    '123',
4
    'message', 'Payment Required',
5
    'details', 'Quota exceeded',
6
    'hint',    'Upgrade your plan')::text,
7
  detail = json\_build\_object(
8
    'status',  402,
9
    'headers', json\_build\_object(
10
      'X-Powered-By', 'Nerd Rage'))::text;

#### The exception produces this HTTP response:

1
HTTP/1.1 402 Payment Required
2
Content-Type: application/json; charset=utf-8
3
X-Powered-By: Nerd Rage
4
5
{
6
  "message": "Payment Required",
7
  "details": "Quota exceeded",
8
  "hint": "Upgrade your plan",
9
  "code": "123"
10
}

Use JSON functions and operators to build dynamic responses from exceptions. Include the

status\_text

clause when you use a custom HTTP status code such as 419. See

JSON Functions and Operators

https://www.postgresql.org/docs/current/functions-json.html

in the Postgres documentation.

For PostgREST 11 or earlier, use the legacy syntax for raising errors.

Check your PostgREST version

https://supabase.com/dashboard/project/\_/settings/general

in the Dashboard. See

Raise errors with HTTP status codes

https://postgrest.org/en/stable/references/errors.html#raise-errors-with-http-status-codes

in the PostgREST documentation.

Configure Data API security

https://supabase.com/docs/guides/api/securing-your-api#configure-data-api-security

This section groups the procedures for configuring each security control. Apply the procedures that match your architecture.

Grant access explicitly

https://supabase.com/docs/guides/api/securing-your-api#grant-access-explicitly

A table isn't reachable through the Data API unless you have granted a role privileges on it. Grant the minimum privileges each role needs. For example:

1
-- Read-only access for anonymous clients
2
grant select on table public.your\_table to anon;
3
4
-- Full access for signed-in users; RLS still applies
5
grant select, insert, update, delete on table public.your\_table to authenticated;
6
7
-- Full access for server-side code using the service role
8
grant select, insert, update, delete on table public.your\_table to service\_role;
9
10
-- For functions, grant EXECUTE to the roles that should call them
11
grant execute on function public.your\_function() to anon, authenticated;

If a required grant is missing, PostgREST returns a

error with a hint that names the exact

statement you need:

1
{
2
  "code": "42501",
3
  "message": "permission denied for table your\_table",
4
  "hint": "Grant the required privileges to the current role with: GRANT SELECT ON public.your\_table TO anon;"
5
}

Database API 42501 errors

https://supabase.com/docs/guides/troubleshooting/database-api-42501-errors

for the full troubleshooting flow.

Bundle grants with your RLS setup in the same migration. The

command controls role access. The

enable row level security

command and policies control row access.

Revoke default privileges

https://supabase.com/docs/guides/api/securing-your-api#revoke-default-privileges

Revoke automatic grants when you want new objects in

to remain inaccessible until you grant access:

https://supabase.com/dashboard/project/\_/sql/new

#### Run the following statements:

1
alter default privileges for role postgres in schema public
2
  revoke select, insert, update, delete on tables from anon, authenticated, service\_role;
3
4
alter default privileges for role postgres in schema public
5
  revoke execute on functions from anon, authenticated, service\_role;
6
7
alter default privileges for role postgres in schema public
8
  revoke usage, select on sequences from anon, authenticated, service\_role;
9
10
alter default privileges for role postgres in schema public
11
  revoke execute on functions from public;

New tables, functions, and sequences now require explicit grants before Data API roles can access them.

Disable the Data API

https://supabase.com/docs/guides/api/securing-your-api#disable-the-data-api

If your app never uses Supabase client libraries, REST, or GraphQL data endpoints, turn the Data API off:

Data API integration overview

https://supabase.com/dashboard/project/\_/integrations/data\_api/overview

in the Dashboard.

Enable Data API

With the Data API disabled, none of the auto-generated REST endpoints respond, regardless of grants or RLS.

Enable RLS policies

https://supabase.com/docs/guides/api/securing-your-api#enable-rls-policies

Tables and views exposed through the Data API without RLS can be accessed by any role with matching grants. Enable RLS or add equivalent controls to prevent unauthorized access. RLS doesn't apply to functions, so grant

only to the roles that need to call them. Review every

SECURITY DEFINER

function carefully.

Enable RLS on every table and view exposed through the Data API. You can then write policies that grant users access to specific rows based on their authentication token.

Tables created through the Supabase Dashboard have RLS enabled by default. Enable RLS explicitly for tables created in the SQL Editor or through another tool:

Dashboard SQL

Database > Policies

https://supabase.com/dashboard/project/\_/database/policies

page in the Dashboard.

to enable Row Level Security.

With RLS enabled, create policies that control which data users can access and update. See

Row Level Security

https://supabase.com/docs/guides/database/postgres/row-level-security

Configure a pre-request function

https://supabase.com/docs/guides/api/securing-your-api#configure-a-pre-request-function

Create and register a Postgres function to run checks before each Data API request:

Before adding the check logic, review

Request information

https://supabase.com/docs/guides/api/securing-your-api#request-information

Error responses

https://supabase.com/docs/guides/api/securing-your-api#error-responses

#### Create a pre-request function:

1
create function public.check\_request()
2
  returns void
3
  language plpgsql
4
  security definer
5
  as $$
6
begin
7
  -- your logic here
8
end;
9
$$;

#### Register the function to run on every Data API request:

1
alter role authenticator
2
  set pgrst.db\_pre\_request = 'public.check\_request';

#### Reload the PostgREST configuration:

1
notify pgrst, 'reload config';

The function now runs before every Data API request. Add the checks that match your security requirements.

Pre-request examples

https://supabase.com/docs/guides/api/securing-your-api#pre-request-examples

Use these examples after you configure the pre-request function. Each example replaces the placeholder logic with a complete request check.

Rate limit per IP Use additional API keys

You can only rate-limit

requests run in read-only mode. They can be served by

Read Replicas

https://supabase.com/docs/guides/platform/read-replicas

, which don't support writing to the database.

private.rate\_limits

table records the IP address and timestamp of each write request.

The function rejects requests with an HTTP 420 response when an IP address makes more than 100 write requests in 5 minutes.

#### Create the table:

1
create table private.rate\_limits (
2
  ip inet,
3
  request\_at timestamp
4
);
5
6
-- add an index so that lookups are fast
7
create index rate\_limits\_ip\_request\_at\_idx on private.rate\_limits (ip, request\_at desc);

schema prevents Data API access to the rate-limit records.

#### Create the request check:

public.check\_request

1
create function public.check\_request()
2
  returns void
3
  language plpgsql
4
  security definer
5
  as $$
6
declare
7
  req\_method text := current\_setting('request.method', true);
8
  req\_ip inet := split\_part(
9
    current\_setting('request.headers', true)::json->>'x-forwarded-for',
10
    ',', 1)::inet;
11
  count\_in\_five\_mins integer;
12
begin
13
  if req\_method = 'GET' or req\_method = 'HEAD' or req\_method is null then
14
    -- rate limiting can't be done on GET and HEAD requests
15
    return;
16
  end if;
17
18
  select
19
    count(\*) into count\_in\_five\_mins
20
  from private.rate\_limits
21
  where
22
    ip = req\_ip and request\_at between now() - interval '5 minutes' and now();
23
24
  if count\_in\_five\_mins > 100 then
25
    raise sqlstate 'PGRST' using
26
      message = json\_build\_object(
27
        'message', 'Rate limit exceeded, try again after a while')::text,
28
      detail = json\_build\_object(
29
        'status',  420,
30
        'status\_text', 'Enhance Your Calm')::text;
31
  end if;
32
33
  insert into private.rate\_limits (ip, request\_at) values (req\_ip, now());
34
end;
35
  $$;

#### Register the request check:

Configure the

public.check\_request()

function to run on every Data API request:

1
alter role authenticator
2
  set pgrst.db\_pre\_request = 'public.check\_request';
3
4
notify pgrst, 'reload config';

#### Clean up old records:

https://supabase.com/docs/guides/database/extensions/pg\_cron

job to delete old entries from

private.rate\_limits

Edit this page on GitHub

https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/api/securing-your-api.mdx

Is this helpful?

Connect your AI agent

https://supabase.com/docs/guides/ai-tools

Copy as Markdown

Ask ChatGPT

https://chatgpt.com/?hint=search&q=Read%20from%20https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fapi%2Fsecuring-your-api%20so%20I%20can%20ask%20questions%20about%20its%20contents

https://claude.ai/new?q=Read%20from%20https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fapi%2Fsecuring-your-api%20so%20I%20can%20ask%20questions%20about%20its%20contents

On this page

Understand Data API security

https://supabase.com/docs/guides/api/securing-your-api#understand-data-api-security

Grants and RLS

https://supabase.com/docs/guides/api/securing-your-api#grants-and-rls

Default privileges

https://supabase.com/docs/guides/api/securing-your-api#default-privileges

Dedicated API schemas

https://supabase.com/docs/guides/api/securing-your-api#dedicated-api-schemas

Pre-request checks

https://supabase.com/docs/guides/api/securing-your-api#pre-request-checks

Request information

https://supabase.com/docs/guides/api/securing-your-api#request-information

Error responses

https://supabase.com/docs/guides/api/securing-your-api#error-responses

Configure Data API security

https://supabase.com/docs/guides/api/securing-your-api#configure-data-api-security

Grant access explicitly

https://supabase.com/docs/guides/api/securing-your-api#grant-access-explicitly

Revoke default privileges

https://supabase.com/docs/guides/api/securing-your-api#revoke-default-privileges

Disable the Data API

https://supabase.com/docs/guides/api/securing-your-api#disable-the-data-api

Enable RLS policies

https://supabase.com/docs/guides/api/securing-your-api#enable-rls-policies

Configure a pre-request function

https://supabase.com/docs/guides/api/securing-your-api#configure-a-pre-request-function

Pre-request examples

https://supabase.com/docs/guides/api/securing-your-api#pre-request-examples

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

