type SendWhatsAppTemplateArgs = {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParameters?: string[];
};

type WhatsAppSendResult = {
  status: 'sent' | 'failed' | 'not_configured';
  error?: string;
};

const normalizeWhatsAppNumber = (value: string) =>
  value.replace(/[^\d]/g, '');

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = 'en',
  bodyParameters = [],
}: SendWhatsAppTemplateArgs): Promise<WhatsAppSendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { status: 'not_configured' };
  }

  const recipient = normalizeWhatsAppNumber(to);

  if (!recipient) {
    return {
      status: 'failed',
      error: 'Invalid WhatsApp number',
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: bodyParameters.length
              ? [
                  {
                    type: 'body',
                    parameters: bodyParameters.map((text) => ({
                      type: 'text',
                      text,
                    })),
                  },
                ]
              : undefined,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        status: 'failed',
        error:
          result?.error?.message ||
          'WhatsApp notification failed',
      };
    }

    return { status: 'sent' };
  } catch {
    return {
      status: 'failed',
      error: 'WhatsApp provider unavailable',
    };
  }
}
