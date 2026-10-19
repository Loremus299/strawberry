//#region src/index.ts
const C = {
	reset: "\x1B[0m",
	gray: "\x1B[90m",
	green: "\x1B[32m",
	yellow: "\x1B[33m",
	red: "\x1B[31m",
	blue: "\x1B[34m",
	magenta: "\x1B[35m",
	cyan: "\x1B[36m"
};
function colorForKey(key) {
	if (key == "error") return C.red;
	if (key == "warn") return C.yellow;
	if (key == "info") return C.green;
	if (key == "debug") return C.magenta;
	if (key == "trace") return C.gray;
	if (key == "sub") return C.blue;
	return C.reset;
}
var Logger = class Logger {
	ctx;
	lastTime;
	constructor() {
		this.ctx = {
			id: globalThis.crypto.randomUUID(),
			time: /* @__PURE__ */ new Date(),
			logEntries: [],
			children: [],
			nestLevel: 0
		};
		this.lastTime = /* @__PURE__ */ new Date();
	}
	push(type, key, value) {
		const time = /* @__PURE__ */ new Date();
		this.ctx.logEntries.push({
			type,
			key,
			value,
			time
		});
		const padding = this.ctx.nestLevel * 4;
		const color = colorForKey(type);
		const first = this.ctx.logEntries.length == 1 && this.ctx.nestLevel == 0;
		const isObject = typeof value == "object";
		const delta = time.getTime() - this.lastTime.getTime();
		if (first) {
			console.log(`${C.blue}+ REQUESTID ${this.id}${C.reset}`);
			console.log(`${C.blue}+ TIMESTAMP ${time.toISOString()}${C.reset}`);
		}
		console.log(`${color}${"-".repeat(padding)}| +${delta}ms ${type.toUpperCase()} ${key}: ${isObject ? `${C.cyan}{${C.reset}` : value}${C.reset}`);
		if (isObject) {
			if (type === "sub") return;
			for (const [name, val] of Object.entries(value)) console.log(`${C.cyan}${"-".repeat(padding)}|   ${name}: ${val}${C.reset}`);
			console.log(`${C.cyan}${"-".repeat(padding)}| }${C.reset}`);
		}
		this.lastTime = time;
	}
	error(key, value) {
		this.push("error", key, value);
	}
	warn(key, value) {
		this.push("warn", key, value);
	}
	info(key, value) {
		this.push("info", key, value);
	}
	debug(key, value) {
		this.push("debug", key, value);
	}
	trace(key, value) {
		this.push("trace", key, value);
	}
	sub(key, value) {
		this.push("sub", key, value);
	}
	nest(title) {
		const child = new Logger();
		child.ctx.nestLevel = this.ctx.nestLevel + 1;
		this.ctx.children.push(child);
		this.sub(title, {
			from: this.id,
			to: child.id,
			title
		});
		return child;
	}
	get id() {
		return this.ctx.id;
	}
};
//#endregion
export { Logger };
