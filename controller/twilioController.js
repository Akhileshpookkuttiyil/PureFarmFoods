require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID; // Your Verify Service SID


// Log the Verify Service SID for debugging
console.log("Verify Service SID:", verifyServiceSid);

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Using module.exports for clarity
module.exports = {
    sendVerification: async (req, res) => {
        const { phoneNumber } = req.body;
        try {
            const verification = await client.verify.v2.services(verifyServiceSid)
                .verifications
                .create({
                    to: phoneNumber,
                    channel: 'sms'
                });
    
            res.status(200).json({ message: 'Verification code sent!', sid: verification.sid });
        } catch (error) {
            console.error("Twilio error:", error);
            res.status(500).json({ message: 'Failed to send verification code', error: error.message });
        }
    },
    
    // Function to verify the code
    verifyCode: async (req, res) => {
        const { phoneNumber, code } = req.body;
        try {
            const verificationCheck = await client.verify.v2.services(verifyServiceSid)
                .verificationChecks
                .create({ to: phoneNumber, code });
    
            if (verificationCheck.status === 'approved') {
                res.status(200).json({ message: 'Phone number verified successfully!' });
            } else {
                res.status(400).json({ message: 'Incorrect verification code' });
            }
        } catch (error) {
            console.error("Verification error:", error);
            res.status(500).json({ message: 'Verification failed', error: error.message });
        }
    }
};