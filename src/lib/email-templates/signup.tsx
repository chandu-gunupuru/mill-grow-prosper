import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import { BRAND, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to start ordering with {BRAND.name}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.brandRow}>{BRAND.short}</Text>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Welcome — confirm your email</Heading>
          <Text style={styles.text}>
            Thanks for signing up. Please confirm <strong>{recipient}</strong> so we can keep your
            orders and account secure.
          </Text>
          <Section style={styles.buttonWrap}>
            <Link style={styles.button} href={confirmationUrl}>Verify email</Link>
          </Section>
          <Text style={styles.muted}>
            Or paste this link into your browser:<br />
            <Link href={confirmationUrl} style={styles.link}>{confirmationUrl}</Link>
          </Text>
        </Section>
        <Hr style={styles.divider} />
        <Section style={styles.footer}>
          <Text style={{ margin: 0 }}>{BRAND.tagline}</Text>
          <Text style={{ margin: '6px 0 0' }}>
            Didn't sign up? You can safely ignore this email.{' '}
            <Link href={siteUrl} style={{ color: BRAND.primary }}>Visit site</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
