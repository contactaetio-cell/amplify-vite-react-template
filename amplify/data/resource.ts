import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { generateInsights } from "../functions/generate-insights/resource";
/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({ 
Insight: a.customType({
    insight_id: a.string().required(),
    parent_insight_id: a.string(),
    project_id: a.string(),
    organization_id: a.string(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    text: a.string().required(),
    family_text: a.string(),
    question_answered: a.string(),
    summary: a.string(),
    filters: a.string().array(),
    document_ids: a.string().array(),
    source_types: a.string().array(),
    evidence_snippet: a.string(),
    supporting_chunks: a.json().array(), // [{chunk_id, paragraph_index?, line_index?}]
    findings: a.json().array(),
    metadata: a.json().array(), // [{tag, value, confidence}]
    confidence: a.customType({
      score: a.float(),
      reasoning: a.string(),
    }),
    additional_refs: a.json(),
    user_id: a.string(),
    user_info: a.customType({
      full_name: a.string(),
      email_address: a.string(),
    }),
    status: a.string(),
    s3_node: a.string().required(),
    document_id: a.string().required(),
  }), 
  generateInsights: a
    .mutation()
    .arguments({
      uploadMode: a.string(),
      researchContext: a.string(),
      contextUrls: a.string().array(),
      outputUrls: a.string().array(),
      rawDataUrls: a.string().array(),
      userId: a.string(),
      user_info: a.customType({
        full_name: a.string(),
        email_address: a.string(),
      }),
      userInfo: a.customType({
        full_name: a.string(),
        email_address: a.string(),
      }),
      image_blocks: a
        .customType({
          block_id: a.string().required(),
          image_s3: a.string().required(),
          page: a.integer().required(),
        })
        .array(),
      document_id: a.string(),
    })
    .returns(a.string())
    .authorization(allow => [allow.guest(), allow.authenticated(), allow.publicApiKey()])
    .handler(a.handler.function(generateInsights)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
