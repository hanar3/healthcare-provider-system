// encrypt.ts
const enc = new TextEncoder();
const dec = new TextDecoder();

const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY_BASE64!, "base64");

if (key.length !== 32) throw new Error("Invalid key length");

const cryptoKey = await crypto.subtle.importKey(
	"raw",
	key,
	{ name: "AES-GCM" },
	false,
	["encrypt", "decrypt"]
);

export async function encrypt(plain: string) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const cipher = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		cryptoKey,
		enc.encode(plain)
	);

	return {
		iv: Buffer.from(iv).toString("base64"),
		data: Buffer.from(cipher).toString("base64"),
	};
}

export async function decrypt(payload: { iv: string; data: string }) {
	const iv = Buffer.from(payload.iv, "base64");
	const data = Buffer.from(payload.data, "base64");

	const plain = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		cryptoKey,
		data
	);

	return dec.decode(plain);
}


