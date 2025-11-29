const Brevo = require('@getbrevo/brevo');
const otpEmailTemplate = require("../templates/otpEmail");

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const SENDER_EMAIL = process.env.EMAIL_USER; // your verified email

const sendEmail = async (to, subject, html) => {
  try {
    const emailObj = new Brevo.SendSmtpEmail();

    emailObj.sender = { 
      name: "Your App", 
      email: SENDER_EMAIL 
    };
    
    emailObj.to = [{ email: to }];
    emailObj.subject = subject;
    emailObj.htmlContent = html;

    const response = await apiInstance.sendTransacEmail(emailObj);

    console.log("Email sent to:", to, response);
  } catch (error) {
    console.error("Brevo Email Error:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = { sendEmail, otpEmailTemplate };
