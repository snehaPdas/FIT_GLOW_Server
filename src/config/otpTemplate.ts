export const otpEmailTemplate = (otp: string, recipientName: string = 'User') => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 10px 0;
        }
        .content {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .otp {
            font-size: 24px;
            color: #4CAF50;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: gray;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        FITGLOW
    </div>
    <div class="content">
        <h2>Your OTP for Registration</h2>
        <p>Dear ${recipientName},</p>
        <p>Thank you for registering with <strong>FITGLOW</strong>. Please use the following OTP to complete your registration process:</p>
        <div class="otp">${otp}</div>
        <p>This OTP is valid for the next 10 minutes.</p>
        <p>If you did not initiate this request, please ignore this email or contact our support team immediately.</p>
    </div>
    <div class="footer">
        Thank you, <br>
        The FIT_GLOW Team
    </div>
</body>
</html>
`;
