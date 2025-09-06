/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:npg_8JViqmlxZh7w@ep-red-union-a19uagoj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    }
  };