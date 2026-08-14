import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import { BRAND, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({ confirmationUrl, token }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your one-tap sign-in link for {BRAND.name}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.brandRow}>{BRAND.short}</Text>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Sign in to your account</Heading>
          <Text style={styles.text}>Use this one-time password to sign in. It expires shortly and can only be used once.</Text>
          {token ? <Text style={styles.code}>{token}</Text> : null}
          <Section style={styles.buttonWrap}>
            <Link style={styles.button} href={confirmationUrl}>Sign in</Link>
          </Section>
          <Text style={styles.muted}>
            Or paste this link into your browser:<br />
            <Link href={confirmationUrl} style={styles.link}>{confirmationUrl}</Link>
          </Text>
        </Section>
        <Hr style={styles.divider} />
        <Section style={styles.footer}>
          <Text style={{ margin: 0 }}>
            Didn't request this link? You can safely ignore the email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
