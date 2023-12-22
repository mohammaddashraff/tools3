# Use the official PostgreSQL image as the base image
FROM postgres:16

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=asdyfe2rd
ENV POSTGRES_DB=webclinic

# Run the initialization script to set up the initial database schema and data
COPY init.sql /docker-entrypoint-initdb.d/

# Run the container as root during initialization
USER root

# Change ownership of directories on the host machine
RUN chown -R 1008510000:0 /var/lib/postgresql/data \
    && chown -R 1008510000:0 /var/run/postgresql

# Switch back to the specified user
USER 1008510000
