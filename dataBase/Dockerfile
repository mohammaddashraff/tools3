# Use the official PostgreSQL image as the base image
FROM postgres:16

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=asdyfe2rd
ENV POSTGRES_DB=webclinic

# Copy initialization script to set up the initial database schema and data
COPY init.sql /docker-entrypoint-initdb.d/

# Switch to the root user temporarily to perform privileged operations
USER root

# Set ownership and permissions for the specified directories
RUN chown -R postgres:postgres /var/lib/postgresql/data /var/run/postgresql \
    && chmod 700 /var/lib/postgresql/data /var/run/postgresql

# Switch back to the non-root user provided by the base image
USER postgres
