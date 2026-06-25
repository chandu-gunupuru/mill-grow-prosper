import * as React from 'react'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'
import { BRAND, styles } from './_brand'
import type { TemplateEntry } from './registry'

interface HelpCenterConfirmationProps {
  name?: string
  topic?: string
  message?: string
}

export const HelpCenterConfirmationEmail = ({
  name,
  topic,
  message,
}: HelpCenterConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your question — {BRAND.name}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.brandRow}>{BRAND.short}</Text>
          <Text style={styles.brandName}>{BRAND.name}</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Thanks for reaching out</Heading>
          <Text style={styles.text}>
            Hi {name || 'there'},
          </Text>
          <Text style={styles.text}>
            We received your question about <strong>{topic || 'your inquiry'}</strong>. Our support team will review it and get back to you as soon as possible.
          </Text>
          {message ? (
            <Section
              style={{
                backgroundColor: BRAND.cream,
                border: `1px solid ${BRAND.border}`,
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '18px',
              }}
            >
              <Text
                style={{
                  ...styles.muted,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{message}&rdquo;
              </Text>
            </Section>
          ) : null}
          <Text style={styles.text}>
            If you need urgent help, call or WhatsApp us directly from the Help Center.
          </Text>
        </Section>
        <Hr style={styles.divider} />
        <Section style={styles.footer}>
          <Text style={{ margin: 0 }}>{BRAND.tagline}</Text>
          <Text style={{ margin: '6px 0 0' }}>
            <Link
              href="https://mill-grow-prosper-demo.lovable.app/help"
              style={{ color: BRAND.primary }}
            >
              Visit Help Center
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HelpCenterConfirmationEmail,
  subject: `We received your question — ${BRAND.name}`,
  displayName: 'Help Center Confirmation',
  previewData: {
    name: 'Priya',
    topic: 'Bulk order',
    message: 'Do you offer 50 kg wholesale bags?',
  },
} satisfies TemplateEntry

export default HelpCenterConfirmationEmail
