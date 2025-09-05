# Mirror Analysis Platform

A secure, privacy-focused psychological analysis platform that provides deep insights into personality and communication patterns through encrypted analysis of personal data.

## 🔒 Privacy & Security

This platform uses **end-to-end encryption** to ensure your personal data remains private. Your data is encrypted on your device before being sent to our servers, and only you can decrypt the analysis results using your password.

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mirror
```

### 2. Backend Setup (Django)

#### Quick Setup (Recommended)

```bash
# Complete setup: create venv, install deps, run migrations
make setup
```

#### Environment Configuration

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=your-openai-api-key
```

### 3. Frontend Setup (React + Vite)

#### Install Node.js Dependencies

```bash
# Install frontend dependencies
make frontend_install
```

### 4. Start Development Servers

```bash
# Terminal 1: Start Django backend
make runserver

# Terminal 2: Start React frontend
make frontend_dev
```

### 5. Access the Application

- http://localhost:5173

## 🔐 Encryption Process Explained

The platform uses a sophisticated **hybrid encryption system** combining multiple cryptographic techniques to ensure maximum security:

### 1. Key Generation (Client-Side)

When you first upload data, the system:

1. **Generates X25519 Key Pair**: Creates a unique public/private key pair using elliptic curve cryptography
2. **Password-Based Key Derivation**: Uses Argon2id (a memory-hard KDF) to derive a Key Encryption Key (KEK) from your password
3. **Private Key Wrapping**: Encrypts the private key using XChaCha20-Poly1305 AEAD encryption with the KEK

```javascript
// Key generation process
const {publicKey, privateKey} = sodium.crypto_box_keypair();
const kek = sodium.crypto_pwhash(32, password, salt, ops, mem, ALG_ARGON2ID13);
const encryptedPrivateKey = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    privateKey, null, null, nonce, kek
);
```

### 2. Data Encryption (Server-Side)

When analysis is complete, the server:

1. **Generates Data Encryption Key (DEK)**: Creates a random 32-byte key for encrypting the analysis data
2. **Encrypts Analysis Data**: Uses XChaCha20-Poly1305 to encrypt the analysis with the DEK
3. **Seals DEK**: Uses X25519 sealed box to encrypt the DEK with your public key
4. **Stores Encrypted Bundle**: Saves the encrypted data and sealed DEK to the database

```python
# Server-side encryption
dek = os.urandom(32)  # Data Encryption Key
nonce = os.urandom(24)
encrypted_data = crypto_aead_xchacha20poly1305_ietf_encrypt(
    analysis_data, aad, nonce, dek
)
sealed_dek = crypto_box_seal(dek, user_public_key)
```

### 3. Data Decryption (Client-Side)

When you access your analysis:

1. **Unwrap Private Key**: Decrypts your private key using your password
2. **Open Sealed DEK**: Uses your private key to decrypt the DEK from the sealed box
3. **Decrypt Analysis**: Uses the DEK to decrypt the analysis data
4. **Display Results**: Shows the decrypted analysis in the UI

```javascript
// Decryption process
const kek = sodium.crypto_pwhash(32, password, salt, ops, mem, ALG_ARGON2ID13);
const privateKey = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, encryptedPrivateKey, null, nonce, kek
);
const dek = sodium.crypto_box_seal_open(sealedDek, publicKey, privateKey);
const analysis = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, encryptedData, aad, nonce, dek
);
```

### 4. Security Features

- **Zero-Knowledge Architecture**: Server never sees your password or unencrypted data
- **Perfect Forward Secrecy**: Each analysis uses unique encryption keys
- **Memory-Hard KDF**: Argon2id prevents brute-force attacks
- **Authenticated Encryption**: XChaCha20-Poly1305 prevents tampering
- **Key Derivation**: Password never stored, only derived keys
- **Local Storage**: Private keys stored encrypted in browser localStorage

### 5. Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   Database  │
│             │    │             │    │             │
│ 1. Generate │    │             │    │             │
│    Keypair  │    │             │    │             │
│             │    │             │    │             │
│ 2. Encrypt  │───▶│ 3. Store    │───▶│ 4. Save     │
│    Data     │    │    Encrypted│    │    Encrypted│
│             │    │    Data     │    │    Bundle   │
│             │    │             │    │             │
│ 5. Request  │───▶│ 6. Return   │───▶│ 7. Retrieve │
│    Analysis │    │    Encrypted│    │    Encrypted│
│             │    │    Bundle   │    │    Bundle   │
│ 8. Decrypt  │◀───│             │    │             │
│    & Show   │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```
---

**Note**: This platform prioritizes privacy and security. Your personal data is encrypted end-to-end and never stored in plaintext on our servers.
