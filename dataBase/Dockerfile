# Use the official PostgreSQL image as the base image
FROM postgres:16

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=asdyfe2rd
ENV POSTGRES_DB=webclinic

# Create a non-root user
RUN adduser \
  --no-create-home \
  --system \
  --shell /usr/sbin/nologin \
  db-user

# Copy initialization script to set up the initial database schema and data
COPY init.sql /docker-entrypoint-initdb.d/

# Set permissions for OpenShift
RUN chown -R db-user:db-user /var/lib/postgresql/data /var/run/postgresql

# Switch to the non-root user
USER db-user
