package com.tcs.plts.service;

import com.tcs.plts.exception.EmailDeliveryException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:}")
    private String configuredFromAddress;

    @Value("${spring.mail.host:}")
    private String configuredMailHost;

    @Value("${spring.mail.username:}")
    private String configuredMailUsername;

    @Value("${spring.mail.password:}")
    private String configuredMailPassword;

    @Value("${spring.mail.properties.mail.smtp.auth:true}")
    private boolean smtpAuthenticationEnabled;

    public void sendEmail(String to, String subject, String bodyHtml) {
        validateConfiguration();
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new EmailDeliveryException("Email delivery is not available. Check the SMTP configuration.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);
            helper.setFrom(resolveFromAddress());
            mailSender.send(message);
            log.info("Email sent to {} with subject '{}'", to, subject);
        } catch (EmailDeliveryException e) {
            throw e;
        } catch (MailAuthenticationException e) {
            log.error("SMTP authentication failed for host {}", configuredMailHost, e);
            throw new EmailDeliveryException("Email authentication failed. Verify the SMTP username and password (use a Gmail app password for Gmail).", e);
        } catch (MailSendException e) {
            log.error("SMTP host {} did not accept the message", configuredMailHost, e);
            throw new EmailDeliveryException("The email server did not accept the message. Verify the SMTP host, port, TLS settings, and recipient address.", e);
        } catch (Exception e) {
            log.error("Unable to send email to {}", to, e);
            throw new EmailDeliveryException("Unable to send verification email. Please try again later.", e);
        }
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(configuredMailHost)) {
            throw new EmailDeliveryException("Email delivery is not configured. Set SPRING_MAIL_HOST and MAIL_FROM.");
        }
        if (smtpAuthenticationEnabled
                && (!StringUtils.hasText(configuredMailUsername) || !StringUtils.hasText(configuredMailPassword))) {
            throw new EmailDeliveryException("Email delivery is not configured. Set SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD.");
        }
        if (!StringUtils.hasText(configuredFromAddress) && !StringUtils.hasText(configuredMailUsername)) {
            throw new EmailDeliveryException("Email delivery is not configured. Set MAIL_FROM or SPRING_MAIL_USERNAME.");
        }
    }

    private String resolveFromAddress() {
        return StringUtils.hasText(configuredFromAddress) ? configuredFromAddress : configuredMailUsername;
    }

    public String buildOtpTemplate(String name, String otp) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="background-color: #1e40af; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 24px;">Lifecycle Traceability System</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9;">Email Verification / Authentication</p>
                </div>
                <div style="padding: 32px; background-color: #ffffff; color: #1e293b;">
                    <p style="font-size: 16px; margin-top: 0;">Hello <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #475569;">Use the One-Time Password (OTP) below to authenticate your request:</p>
                    <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1d4ed8;">%s</span>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    &copy; 2026 Enterprise Lifecycle Traceability System. All rights reserved.
                </div>
            </div>
            """.formatted(name, otp);
    }

    public String buildStakeholderWelcomeTemplate(String companyName, String role, String generatedUserId) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="background-color: #1e40af; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 24px;">Welcome to Lifecycle Traceability</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9;">Stakeholder Registration</p>
                </div>
                <div style="padding: 32px; background-color: #ffffff; color: #1e293b;">
                    <p style="font-size: 16px; margin-top: 0;">Dear <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #475569;">You have been registered as a <strong>%s</strong> stakeholder in the Lifecycle Traceability System.</p>
                    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534; font-weight: 600;">Your Generated Login ID:</p>
                        <span style="font-size: 28px; font-weight: bold; color: #15803d; letter-spacing: 2px;">%s</span>
                    </div>
                    <p style="font-size: 14px; color: #475569;">To log in, use your Generated User ID on the stakeholder login portal. No password is required—an OTP will be sent to your registered email address upon login.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    &copy; 2026 Enterprise Lifecycle Traceability System. All rights reserved.
                </div>
            </div>
            """.formatted(companyName, role, generatedUserId);
    }

    public String buildOrderAssignmentTemplate(String recipientName, String orderNumber, String productName, String stageName) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0;">New Lifecycle Assignment</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9;">Order #%s</p>
                </div>
                <div style="padding: 32px; background-color: #ffffff;">
                    <p>Hello <strong>%s</strong>,</p>
                    <p>You have been assigned to stage <strong>%s</strong> for order <strong>%s</strong> (%s).</p>
                    <p>Please log in to your dashboard to review, accept, and update progress.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                    &copy; 2026 Enterprise Lifecycle Traceability System
                </div>
            </div>
            """.formatted(orderNumber, recipientName, stageName, orderNumber, productName);
    }
}
