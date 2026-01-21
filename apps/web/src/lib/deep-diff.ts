type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Diff<T> = {
	[K in keyof T]?: T[K] extends Primitive
		? T[K]
		: T[K] extends Array<any>
			? T[K]
			: T[K] extends object
				? Diff<T[K]>
				: T[K];
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepDiff<T extends Record<string, any>>(
	oldObj: T,
	newObj: T,
): Partial<T> {
	const result: Partial<Diff<T>> = {};

	for (const key of Object.keys(newObj) as Array<keyof T>) {
		const oldVal = oldObj[key];
		const newVal = newObj[key];

		// Same reference or primitive equality
		if (Object.is(oldVal, newVal)) {
			continue;
		}

		// Both are plain objects → recurse
		if (isObject(oldVal) && isObject(newVal)) {
			const diff = deepDiff(oldVal, newVal);
			if (Object.keys(diff).length > 0) {
				result[key] = diff as Diff<T>[typeof key];
			}
			continue;
		}

		// Arrays or primitive change
		result[key] = newVal as Diff<T>[typeof key];
	}

	return result as Partial<T>;
}
