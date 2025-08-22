import base64
import os
import json
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet

# pip install pynacl
import os, base64
from typing import Optional, Dict
from nacl.bindings import (
    crypto_box_seal,
    crypto_aead_xchacha20poly1305_ietf_encrypt,
)


def _b64e(b: bytes) -> str:
    return base64.b64encode(b).decode("ascii")


def encrypt_for_user(data: bytes, user_pk_b64: str, aad: Optional[bytes] = None) -> Dict[str, str]:
    """
    Envelope-шифрование:
      - генерируем DEK (32 байта) и nonce (24 байта)
      - data -> AEAD XChaCha20-Poly1305 (DEK, nonce, AAD)
      - DEK -> sealed box на публичный ключ пользователя (X25519)
    Возвращает base64-поля: ek (запечатанный DEK), nonce, ct, (aad — если задана).
    """
    user_pk = base64.b64decode(user_pk_b64)
    dek = os.urandom(32)
    nonce = os.urandom(24)
    if aad is None:
        aad = b""

    ct = crypto_aead_xchacha20poly1305_ietf_encrypt(data, aad, nonce, dek)
    ek = crypto_box_seal(dek, user_pk)

    bundle = {
        "alg": "sealedbox(X25519)+XChaCha20-Poly1305",
        "ek": _b64e(ek),
        "nonce": _b64e(nonce),
        "ct": _b64e(ct),
        "ver": "1",
    }
    if aad:
        bundle["aad"] = _b64e(aad)
    return bundle
