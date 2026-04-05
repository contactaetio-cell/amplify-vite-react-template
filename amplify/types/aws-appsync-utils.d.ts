declare module "@aws-appsync/utils" {
  export const util: {
    autoId: () => string;
  };
}

declare module "@aws-appsync/utils/dynamodb" {
  export type PutInput = {
    key: Record<string, unknown>;
    item: Record<string, unknown>;
  };

  export function put(input: PutInput): unknown;
}
