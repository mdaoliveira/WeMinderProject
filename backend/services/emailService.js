// Minimal stub for email sending so server can run during development.
// Replace with real implementation (nodemailer or external service) later.
export const sendPasswordResetEmail = async (email, token) => {
  console.log(`Stub emailService: would send reset email to ${email} with token ${token}`);
  // simulate async success
  return true;
};
