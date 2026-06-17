import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import { BRAND, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email address for {BRAND.name}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.brandRow}>{BRAND.short}</Text>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm your email change</Heading>
          <Text style={styles.text}>
            You requested to change the email on your account from{' '}
            <strong>{oldEmail}</strong> to <strong>{newEmail}</strong>.
          </Text>
          <Section style={styles.buttonWrap}>
            <Link style={styles.button} href={confirmationUrl}>Confirm email change</Link>
          </Section>
          <Text style={styles.muted}>
            Or paste this link into your browser:<br />
            <Link href={confirmationUrl} style={styles.link}>{confirmationUrl}</Link>
          </Text>
        </Section>
        <Hr style={styles.divider} />
        <Section style={styles.footer}>
          <Text style={{ margin: 0 }}>
            Didn't request this change? Please secure your account by resetting your password
            immediately.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
