# Use the official PostgreSQL image as the base image
FROM postgres:16

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=asdyfe2rd
ENV POSTGRES_DB=webclinic

RUN adduser \
  --no-create-home \
  --system \
  --shell /usr/sbin/nologin \
  db-user

# Copy initialization script to set up the initial database schema and data
COPY init.sql /docker-entrypoint-initdb.d/

USER db-user