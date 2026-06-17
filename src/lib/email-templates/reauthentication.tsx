import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import { BRAND, styles } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND.name} verification code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.brandRow}>{BRAND.short}</Text>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm it's you</Heading>
          <Text style={styles.text}>
            Use the verification code below to confirm your identity. This code expires shortly.
          </Text>
          <Text style={styles.code}>{token}</Text>
          <Text style={styles.muted}>
            Never share this code with anyone. {BRAND.short} staff will never ask for it.
          </Text>
        </Section>
        <Hr style={styles.divider} />
        <Section style={styles.footer}>
          <Text style={{ margin: 0 }}>
            Didn't request this? You can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
