import * as React from "react";

interface LoanNotificationTemplateProps {
  firstName: string;
  lastName: string;
  loanAmount: string;
  interestRate: string;
  termMonths: number;
  purpose: string | null;
}

export const LoanNotificationTemplate: React.FC<
  Readonly<LoanNotificationTemplateProps>
> = ({
  firstName,
  lastName,
  loanAmount,
  interestRate,
  termMonths,
  purpose,
}) => (
  <div style={containerStyle}>
    <div style={contentStyle}>
      <h1 style={headingStyle}>New Loan Application Created</h1>
      <p style={paragraphStyle}>
        Hello {firstName} {lastName},
      </p>
      <p style={paragraphStyle}>
        A new loan application has been created on your behalf. Here are the
        details:
      </p>
      <div style={detailsContainerStyle}>
        <div style={detailRowStyle}>
          <span style={detailLabelStyle}>Loan Amount:</span>
          <span style={detailValueStyle}>{loanAmount}</span>
        </div>
        <div style={detailRowStyle}>
          <span style={detailLabelStyle}>Interest Rate:</span>
          <span style={detailValueStyle}>{interestRate}%</span>
        </div>
        <div style={detailRowStyle}>
          <span style={detailLabelStyle}>Term:</span>
          <span style={detailValueStyle}>{termMonths} months</span>
        </div>
        {purpose && (
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Purpose:</span>
            <span style={detailValueStyle}>{purpose}</span>
          </div>
        )}
      </div>
      <p style={paragraphStyle}>
        You will be notified once the loan application is reviewed and a
        decision is made.
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

const detailsContainerStyle: React.CSSProperties = {
  margin: "30px 0",
  padding: "20px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
  textAlign: "left",
};

const detailRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  paddingBottom: "10px",
  borderBottom: "1px solid #eeeeee",
};

const detailLabelStyle: React.CSSProperties = {
  color: "#666666",
  fontWeight: "bold",
};

const detailValueStyle: React.CSSProperties = {
  color: "#333333",
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
