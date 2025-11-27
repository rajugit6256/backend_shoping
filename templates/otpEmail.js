const otpEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Your OTP Code</h2>
      <p>Use the following OTP to verify your email address:</p>
      <h1 style="color: #2E86C1;">${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    </div>
  `;
};

module.exports = otpEmailTemplate;
