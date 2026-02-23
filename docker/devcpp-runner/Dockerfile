FROM ubuntu:22.04

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  curl \
  wget \
  git \
  && rm -rf /var/lib/apt/lists/*

# Create working dir
WORKDIR /work

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
