export interface Theme {
  colorScheme?: "auto" | "dark" | "light";
  logo?: string;
  brandColor?: string;
  buttonText?: string;
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
export function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const buttonText = theme.buttonText || "#fff";
  const logo = theme.logo || "";

  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  return `
<body style="background: ${
    color.background
  }; margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: ${
    color.mainBackground
  }; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="padding: 20px 0; background: ${
        color.buttonBackground
      };">
        ${
          logo
            ? `<img src="${logo}" alt="Logo" style="height: 50px; margin-bottom: 20px;">`
            : ""
        }
        <h1 style="margin: 0; font-size: 24px; color: ${
          color.buttonText
        };">Welcome to ${escapedHost}</h1>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px; font-size: 18px; color: ${
        color.text
      };">
        <p style="margin: 0;">Sign in to continue</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${
              color.buttonBackground
            }">
              <a href="${url}" target="_blank" style="font-size: 18px; font-family: Arial, sans-serif; color: ${
    color.buttonText
  }; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${
    color.buttonBorder
  }; display: inline-block; font-weight: bold;">Sign in</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px; font-size: 16px; line-height: 22px; color: ${
              color.text
            };">
              <p style="margin: 0;">Or copy and paste the link below</p>
              <a href="${url}" style="margin: 0;">${url}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px; font-size: 16px; line-height: 22px; color: ${
        color.text
      };">
        <p style="margin: 0;">If you did not request this email, you can safely ignore it.</p>
        <p style="margin: 0;">For support, contact us at <a href="mailto:support@${escapedHost}" style="color: ${
    color.buttonBackground
  }; text-decoration: none;">support@${escapedHost}</a></p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px; font-size: 12px; color: ${
        color.text
      }; background: ${color.background};">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${escapedHost}. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
export function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
