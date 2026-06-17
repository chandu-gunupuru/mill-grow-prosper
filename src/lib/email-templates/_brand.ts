// Shared brand styling for all auth emails.
// Body bg must remain #ffffff per email-client best practices.
export const BRAND = {
  name: 'Gayathri Modern Rice Mill',
  short: 'Gayathri',
  tagline: 'Premium quality rice, milled with care since 1985.',
  primary: '#7A5418', // warm brown/gold
  accent: '#D4A24C', // soft gold
  ink: '#2A1F12',
  muted: '#6B6358',
  border: '#EFE6D4',
  cream: '#FBF6EC',
} as const;

export const styles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    margin: 0,
    padding: '24px 0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0',
    border: `1px solid ${BRAND.border}`,
    borderRadius: '14px',
    overflow: 'hidden' as const,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: BRAND.cream,
    padding: '28px 32px 22px',
    borderBottom: `1px solid ${BRAND.border}`,
  },
  brandRow: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: BRAND.primary,
    fontWeight: 700 as const,
    margin: 0,
  },
  brandName: {
    fontSize: '22px',
    fontWeight: 700 as const,
    color: BRAND.ink,
    margin: '6px 0 0',
  },
  body: {
    padding: '28px 32px 8px',
  },
  h1: {
    fontSize: '24px',
    fontWeight: 700 as const,
    color: BRAND.ink,
    margin: '0 0 14px',
    lineHeight: '1.25',
  },
  text: {
    fontSize: '15px',
    color: BRAND.ink,
    lineHeight: '1.6',
    margin: '0 0 18px',
  },
  muted: {
    fontSize: '13px',
    color: BRAND.muted,
    lineHeight: '1.6',
    margin: '0 0 14px',
  },
  button: {
    backgroundColor: BRAND.primary,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600 as const,
    borderRadius: '10px',
    padding: '13px 26px',
    textDecoration: 'none',
    display: 'inline-block' as const,
  },
  buttonWrap: {
    margin: '8px 0 24px',
  },
  link: {
    color: BRAND.primary,
    textDecoration: 'underline',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '28px',
    letterSpacing: '0.32em',
    fontWeight: 700 as const,
    color: BRAND.ink,
    backgroundColor: BRAND.cream,
    border: `1px solid ${BRAND.border}`,
    borderRadius: '10px',
    padding: '16px 20px',
    textAlign: 'center' as const,
    margin: '4px 0 22px',
  },
  divider: {
    border: 'none',
    borderTop: `1px solid ${BRAND.border}`,
    margin: '8px 32px',
  },
  footer: {
    padding: '18px 32px 26px',
    backgroundColor: BRAND.cream,
    borderTop: `1px solid ${BRAND.border}`,
    color: BRAND.muted,
    fontSize: '12px',
    lineHeight: '1.5',
  },
};
