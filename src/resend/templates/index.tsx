import * as React from "react";

interface EmailTemplateProps {
  otp: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  otp,
}) => (
  <div style={containerStyle}>
    <div style={contentStyle}>
      <h1 style={headingStyle}>Verification Code</h1>
      <p style={paragraphStyle}>
        Thank you for using our service. Please use the following verification
        code to complete your authentication:
      </p>
      <div style={otpContainerStyle}>
        <span style={otpStyle}>{otp}</span>
      </div>
      <p style={paragraphStyle}>
        This code will expire in 2 minutes. If you did not request this code,
        please ignore this email.
      </p>
      <div style={footerStyle}>
        <p style={footerTextStyle}>
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
);

// Styles
const containerStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "6px",
  textAlign: "center",
};

const headingStyle: React.CSSProperties = {
  color: "#333333",
  fontSize: "24px",
  marginBottom: "20px",
  fontWeight: "bold",
};

const paragraphStyle: React.CSSProperties = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "20px",
};

const otpContainerStyle: React.CSSProperties = {
  margin: "30px 0",
  padding: "15px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
  display: "inline-block",
};

const otpStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "4px",
  color: "#333333",
  fontFamily: "monospace",
};

const footerStyle: React.CSSProperties = {
  marginTop: "30px",
  paddingTop: "20px",
  borderTop: "1px solid #eeeeee",
};

const footerTextStyle: React.CSSProperties = {
  color: "#999999",
  fontSize: "14px",
  fontStyle: "italic",
};
