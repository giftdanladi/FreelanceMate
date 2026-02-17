import emailjs from '@emailjs/react-native';

/**
 * Utility to send password reset emails using official EmailJS SDK.
 */
export const sendResetEmail = async (email: string, code: string) => {
  console.log(`[SDK] Sending reset code ${code} to ${email}`);

  try {
    const templateParams = {
      email: email,
      passcode: code,
    };

    const response = await emailjs.send(
      'service_gzvwpgg',
      'template_yy3v9wg',
      templateParams,
      {
        publicKey: 'OP6bE_W8GV2eCXrft',
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error("EmailJS SDK Error:", error);
    if (error.text) {
      console.error("EmailJS Error Detail:", error.text);
    }
    return false;
  }
};