import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../backend/web-sample/src/main/resources/api/openapi.yaml',
    },
    output: {
      target: './src/core/api/generated/messages.ts',
      schemas: './src/core/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/core/api/client.ts',
          name: 'customInstance',
        },
      },
      mock: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
