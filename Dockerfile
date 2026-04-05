# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/cashflow-autopilot-*.jar app.jar

# Expose the default port
EXPOSE 8060

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
