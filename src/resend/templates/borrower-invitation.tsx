import * as React from "react";

interface BorrowerInvitationTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  loginUrl: string;
}

export const BorrowerInvitationTemplate: React.FC<
  Readonly<BorrowerInvitationTemplateProps>
> = ({ firstName, lastName, loginUrl }) => (
  <div style={containerStyle}>
    <div style={contentStyle}>
      <h1 style={headingStyle}>Welcome to Handedruck</h1>
      <p style={paragraphStyle}>
        Hello {firstName} {lastName},
      </p>
      <p style={paragraphStyle}>
        You have been invited to join Handedruck as a borrower. We&apos;re
        excited to have you on board!
      </p>
      <p style={paragraphStyle}>
        To get started, please click the button below to log in to your account:
      </p>
      <div style={buttonContainerStyle}>
        <a href={loginUrl} style={buttonStyle}>
          Log In to Your Account
        </a>
      </div>
      <p style={paragraphStyle}>
        If you have any questions or need assistance, please don&apos;t hesitate
        to contact our support team.
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

const buttonContainerStyle: React.CSSProperties = {
  margin: "30px 0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#0070f3",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "bold",
  display: "inline-block",
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
