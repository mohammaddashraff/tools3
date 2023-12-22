# Use the official PostgreSQL image as the base image
FROM postgres:16

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=asdyfe2rd
ENV POSTGRES_DB=webclinic

# Copy initialization script to set up the initial database schema and data
COPY init.sql /docker-entrypoint-initdb.d/

RUN chown -R 1008510000:1008510000 /var/lib/postgresql/data