import path from 'path';

type Env = {
  (key: string, defaultValue?: string): string;
  int(key: string, defaultValue?: number): number;
  bool(key: string, defaultValue?: boolean): boolean;
};

export default ({ env }: { env: Env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client as keyof typeof connections],
      acquireConnectionTimeout: env.int(
        'DATABASE_CONNECTION_TIMEOUT',
        60000
      ),
    },
  };
};