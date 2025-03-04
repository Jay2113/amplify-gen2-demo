import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

const schema = a
  .schema({
    User: a
      .model({
        email: a.string(),
        articles: a.hasMany("Article", "authorId"),
      })
      .authorization((allow) => [allow.owner("userPools")]),
    Article: a
      .model({
        title: a.string().required(),
        content: a.string().required(),
        authorId: a.id().required(),
        author: a.belongsTo("User", "authorId"),
      })
      .authorization((allow) => [
        allow.owner("userPools"),
        allow.guest().to(["read"]),
        allow.authenticated().to(["read"]),
      ]),
    Summary: a.customType({
      content: a.string().required(),
    }),
    summarize: a
      .generation({
        aiModel: a.ai.model("Claude 3.5 Sonnet"),
        systemPrompt:
          "Provide an accurate, clear, and concise summary of the provided article. Just output the summary, say nothing else.",
        inferenceConfiguration: {
          maxTokens: 1000,
          temperature: 0.5,
        },
      })
      .arguments({ input: a.string() })
      .returns(a.string())
      .authorization((allow) => [allow.guest(), allow.authenticated()]),
  })
  .authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  name: "AmplifyGen2DemoApp",
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
