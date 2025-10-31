export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  version: string;
  sendEmailWithAttachment: (data: {
    pdfData: Uint8Array;
    email: string;
    subject: string;
    body: string;
    filename: string;
  }) => Promise<{
    success: boolean;
    tempFilePath?: string;
    error?: string;
  }>;
  sendEmailSMTP: (data: {
    pdfData: Uint8Array;
    emailSettings: {
      smtpHost: string;
      smtpPort: string;
      smtpUser: string;
      smtpPass: string;
      fromEmail: string;
      toEmail: string;
      subject: string;
      body: string;
    };
    filename: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}