// Server-only: this module handles credential material and must never be imported by client code.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const NONCE_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const KEY_BYTES = 32;

type EncryptionKey = Buffer | string;

function decodeKey(value: EncryptionKey): Buffer {
	if (Buffer.isBuffer(value)) {
		if (value.length !== KEY_BYTES) {
			throw new Error("MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY must be 32 bytes");
		}
		return Buffer.from(value);
	}

	const encoded = value.trim();
	if (!encoded) {
		throw new Error("MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY is not valid base64");
	}

	let key: Buffer;
	if (/^[A-Za-z0-9_-]+$/.test(encoded)) {
		key = Buffer.from(encoded, "base64url");
	} else if (
		/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) &&
		encoded.length % 4 === 0
	) {
		key = Buffer.from(encoded, "base64");
	} else {
		throw new Error("MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY is not valid base64");
	}

	if (key.length !== KEY_BYTES) {
		throw new Error(
			"MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY must decode to 32 bytes",
		);
	}
	return key;
}

function environmentKey(): Buffer {
	const value = process.env.MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY;
	if (!value) {
		throw new Error("MENTOR_GOOGLE_TOKEN_ENCRYPTION_KEY is not configured");
	}
	return decodeKey(value);
}

function associatedData(mentorId: string, purpose: string): Buffer {
	if (!mentorId || !purpose) throw new Error("Encryption binding is required");
	return Buffer.from(`4herfrika:${purpose}:${mentorId}`, "utf8");
}

export function encryptMentorGoogleSecret(
	plaintext: string,
	mentorId: string,
	purpose: "refresh-token" | "pkce-verifier",
	key: EncryptionKey = environmentKey(),
): string {
	if (!plaintext) throw new Error("Cannot encrypt an empty secret");

	const nonce = randomBytes(NONCE_BYTES);
	const cipher = createCipheriv(ALGORITHM, decodeKey(key), nonce);
	cipher.setAAD(associatedData(mentorId, purpose));
	const ciphertext = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();

	return [
		VERSION,
		nonce.toString("base64url"),
		tag.toString("base64url"),
		ciphertext.toString("base64url"),
	].join(".");
}

export function decryptMentorGoogleSecret(
	serialized: string,
	mentorId: string,
	purpose: "refresh-token" | "pkce-verifier",
	key: EncryptionKey = environmentKey(),
): string {
	const parts = serialized.split(".");
	if (parts.length !== 4 || parts[0] !== VERSION) {
		throw new Error("Invalid encrypted mentor Google secret");
	}

	const nonce = Buffer.from(parts[1], "base64url");
	const tag = Buffer.from(parts[2], "base64url");
	const ciphertext = Buffer.from(parts[3], "base64url");
	if (
		nonce.length !== NONCE_BYTES ||
		tag.length !== AUTH_TAG_BYTES ||
		ciphertext.length === 0
	) {
		throw new Error("Invalid encrypted mentor Google secret");
	}

	try {
		const decipher = createDecipheriv(ALGORITHM, decodeKey(key), nonce);
		decipher.setAAD(associatedData(mentorId, purpose));
		decipher.setAuthTag(tag);
		return Buffer.concat([
			decipher.update(ciphertext),
			decipher.final(),
		]).toString("utf8");
	} catch {
		// Deliberately do not expose whether the key, binding, tag, or ciphertext failed.
		throw new Error("Unable to decrypt mentor Google secret");
	}
}

export function encryptMentorRefreshToken(
	refreshToken: string,
	mentorId: string,
	key?: EncryptionKey,
): string {
	return encryptMentorGoogleSecret(
		refreshToken,
		mentorId,
		"refresh-token",
		key,
	);
}

export function decryptMentorRefreshToken(
	ciphertext: string,
	mentorId: string,
	key?: EncryptionKey,
): string {
	return decryptMentorGoogleSecret(ciphertext, mentorId, "refresh-token", key);
}
