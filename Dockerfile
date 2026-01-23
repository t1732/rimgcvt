ARG RUST_VERSION="1.92.0"
FROM rust:${RUST_VERSION}-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    pkg-config \
    procps \
    curl \
    wget \
    git \
    unzip \
    libcairo2-dev \
    libatk1.0-dev \
    libjavascriptcoregtk-4.1-dev \
    libwebkit2gtk-4.1-dev \
    libsoup-3.0-dev \
    x11-apps \
    zsh \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=appuser
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN groupadd --gid $USER_GID $USERNAME && \
    useradd $USERNAME --create-home --shell /bin/zsh --uid $USER_UID --gid $USER_GID

USER $USERNAME

ARG BUN_VERSION="1.3.6"
RUN curl -fsSL https://bun.sh/install | bash -s -- "bun-v${BUN_VERSION}"

RUN cargo install tauri-cli

ENV HOME="/home/appuser"
ENV BUN_INSTALL="${HOME}/.bun"
ENV PATH="${BUN_INSTALL}/bin:${HOME}/.cargo/bin:${PATH}"

WORKDIR /workspace
