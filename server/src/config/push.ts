import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is missing");
  }

  console.log(
    "FIREBASE_SERVICE_ACCOUNT_BASE64 length:",
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.length
  );

  let serviceAccount: admin.ServiceAccount;
  try {
    serviceAccount = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString("utf-8")
    );
  } catch (err) {
    console.error("Failed to parse Firebase service account:", err);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 JSON");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

initAdmin();

export const push = {
  notifyMany: async (
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string> = {}
  ) => {
    if (!tokens?.length) {
      console.warn("No tokens provided for push notification.");
      return;
    }

    const payloadData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: payloadData,
      });

      console.log("FCM result:", {
        successCount: res.successCount,
        failureCount: res.failureCount,
      });

      const failedTokens: string[] = [];

      res.responses.forEach((r, i) => {
        if (!r.success) {
          const token = tokens[i];
          const errCode = r.error?.code;

          console.error("❌ FCM error for token:", token, {
            code: errCode,
            message: r.error?.message,
          });

          // 🔴 Handle invalid or expired tokens
          if (
            errCode === "messaging/invalid-argument" ||
            errCode === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(token);

            // 👉 Here you should remove token from DB
            // Example (if you have a User collection):
            // await User.updateMany(
            //   { deviceTokens: token },
            //   { $pull: { deviceTokens: token } }
            // );
            console.log(`🗑️ Removed invalid FCM token: ${token}`);
          }
        }
      });

      return { ...res, failedTokens };
    } catch (err: any) {
      console.error("Unexpected error while sending push:", {
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
      throw err;
    }
  },
};
