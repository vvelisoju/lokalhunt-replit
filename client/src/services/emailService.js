import api from './api'

export const emailService = {
  // Send OTP to email
  async sendOTP(email) {
    try {
      const response = await api.post('/email/send-otp', {
        email,
        emailType: 'OTP_VERIFICATION'
      })
      return response.data
    } catch (error) {
      console.error('Failed to send OTP:', error)
      throw error
    }
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/email/verify-otp', {
        email,
        otp
      })

      return response.data
    } catch (error) {
      console.error('Verify OTP failed:', error)
      throw error.response?.data || error
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await api.post('/auth/resend-otp', {
        email
      })

      return response.data
    } catch (error) {
      console.error('Resend OTP failed:', error)
      throw error.response?.data || error
    }
  },

  // Send email using template
  async sendTemplateEmail(emailType, to, placeholderData, cc = []) {
    try {
      const response = await api.post('/email/send', {
        emailType,
        to,
        placeholderData,
        cc
      })
      return response.data
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }
}

export default emailService