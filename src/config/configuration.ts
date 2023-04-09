export const config = () => ({
  tokens: {
    atSecret: process.env.AT_SECRET,
    rtSecret: process.env.RT_SECRET,
  },
  email: {
    gmailEmail: process.env.GMAIL_EMAIL,
    gmailPassword: process.env.GMAIL_PASSWORD,
  },
  databaseUrl: process.env.DATABASE_URL,
  cloud: {
    bucketName: process.env.YANDEX_BUCKET_NAME,
    storageApiKeyId: process.env.YANDEX_STORAGE_API_KEY_ID,
    storageApiKey: process.env.YANDEX_STORAGE_API_KEY,
  },
});
