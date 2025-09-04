import sodium from "libsodium-wrappers-sumo";

/**
 * Создаёт X25519 ключи и шифрует приватный ключ на пароле.
 * Возвращает объект, который можно отправить на сервер (pk, enc_sk, salt, nonce, kdf-параметры).
 */
export async function createAndWrapKeypair(password) {
    await sodium.ready;
    // 1) Случайная пара
    const {publicKey: pk, privateKey: sk} = sodium.crypto_box_keypair();

    // 2) KDF (Argon2id) → KEK
    const salt = sodium.randombytes_buf(16);
    const ops = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
    const mem = sodium.crypto_pwhash_MEMLIMIT_MODERATE;
    const kek = sodium.crypto_pwhash(
        32, password, salt, ops, mem, sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    // 3) Шифруем приватник AEAD'ом (XChaCha20-Poly1305)
    const nonce = sodium.randombytes_buf(
        sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    );
    const enc_sk = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        sk, /*ad=*/null, /*nsec=*/null, nonce, kek
    );

    // 4) Готовим к отправке/хранению (base64)
    const b64 = (u8) => sodium.to_base64(u8, sodium.base64_variants.ORIGINAL);
    return [{
        pk: b64(pk),
        enc_sk: b64(enc_sk),
        salt: b64(salt),
        nonce: b64(nonce),
        kdf: {alg: "argon2id13", ops, mem, n: 32},
        aead: {alg: "xchacha20poly1305-ietf"},
        ver: 1,
    }, sk];
}

/**
 * Расшифровывает приватный ключ из enc_sk с помощью пароля.
 * Возвращает { sk, pk, pk_b64 }.
 */
export async function unwrapPrivateKey(wrapped, password) {
    await sodium.ready;
    const fromB64 = (s) => sodium.from_base64(s, sodium.base64_variants.ORIGINAL);

    const enc_sk = fromB64(wrapped.enc_sk);
    const salt = fromB64(wrapped.salt);
    const nonce = fromB64(wrapped.nonce);
    const ops = wrapped?.kdf?.ops ?? sodium.crypto_pwhash_OPSLIMIT_MODERATE;
    const mem = wrapped?.kdf?.mem ?? sodium.crypto_pwhash_MEMLIMIT_MODERATE;

    const kek = sodium.crypto_pwhash(
        32, password, salt, ops, mem, sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    const sk = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        /*nsec=*/null, enc_sk, /*ad=*/null, nonce, kek
    );

    // Восстанавливаем публичный ключ из приватного
    const pk = sodium.crypto_scalarmult_base(sk);

    const toB64 = (u8) => sodium.to_base64(u8, sodium.base64_variants.ORIGINAL);
    return {sk, pk, pk_b64: toB64(pk)};
}

/**
 * Расшифровывает bundle с бэка:
 *  - ek  (sealed DEK под наш pk)
 *  - ct  (XChaCha20-Poly1305)
 *  - nonce
 *  - optional aad
 * На вход: {ek, ct, nonce, [aad]} и наш приватный ключ sk (Uint8Array).
 * Возвращает Uint8Array plaintext.
 */
export async function decryptDataFromServer(bundle, sk) {
    await sodium.ready;
    const fromB64 = (s) => sodium.from_base64(s, sodium.base64_variants.ORIGINAL);

    // 1) Получаем свой публичный (из приватного), он нужен для seal_open
    const pk = sodium.crypto_scalarmult_base(sk);

    // 2) Достаём DEK из sealed box
    const ek = fromB64(bundle.ek);
    const dek = sodium.crypto_box_seal_open(ek, pk, sk);

    // 3) AEAD-расшифровка полезной нагрузки
    const nonce = fromB64(bundle.nonce);
    const ct = fromB64(bundle.ct);
    const aad = bundle.aad ? fromB64(bundle.aad) : null;

    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        /*nsec=*/null, ct, aad, nonce, dek
    );
    return plaintext; // Uint8Array; при необходимости преобразуйте в строку
    // return new TextDecoder().decode(plaintext);
}