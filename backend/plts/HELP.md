# Getting Started

## Email OTP setup

OTP emails are delivered through Spring Mail. For local development, copy
`.env.example` to `.env`, fill in the SMTP values, and restart the backend. The
application loads this file automatically and Git ignores it. Do not put credentials
in `application.yml`.

```bash
cp .env.example .env
./mvnw spring-boot:run
```

Alternatively, provide SMTP credentials as environment variables before starting the
backend:

```bash
export SPRING_MAIL_HOST=smtp.gmail.com
export SPRING_MAIL_PORT=587
export SPRING_MAIL_USERNAME=your-address@gmail.com
export SPRING_MAIL_PASSWORD=your-16-character-app-password
export MAIL_FROM=your-address@gmail.com
./mvnw spring-boot:run
```

For Gmail, `SPRING_MAIL_PASSWORD` must be a Google App Password, not the normal
account password. Other SMTP providers can use the same variables and override the
`SPRING_MAIL_SMTP_*` values when their TLS requirements differ.

The organization flow is: signup → `/verify-org-otp`, then login with email and
password → `/verify-org-login-otp`. Each new OTP replaces the previous unused OTP
for that flow and expires after 10 minutes.

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.1.0/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.1.0/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/4.1.0/reference/web/servlet.html)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/4.1.0/reference/using/devtools.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/4.1.0/reference/data/sql.html#data.sql.jpa-and-spring-data)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.
