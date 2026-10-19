const C = {
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

function colorForKey(key: LogType) {
	if (key == "error") return C.red;
	if (key == "warn") return C.yellow;
	if (key == "info") return C.green;
	if (key == "debug") return C.magenta;
	if (key == "trace") return C.gray;
	if (key == "sub") return C.blue;
	return C.reset;
}

type LogType = "error" | "warn" | "info" | "debug" | "trace" | "sub";

interface LogEntry {
	type: LogType;
	key: string;
	value: Object;
	time: Date;
}

type LogContext = {
	id: string;
	time: Date;

	logEntries: Array<LogEntry>;
	children: Array<Logger>;

	nestLevel: number;
};

export class Logger {
	private readonly ctx: LogContext;
	private lastTime: Date;

	constructor() {
		this.ctx = {
			id: globalThis.crypto.randomUUID(),
			time: new Date(),

			logEntries: [],
			children: [],
			nestLevel: 0,
		};
		this.lastTime = new Date();
	}

	private prettyPrint(type: LogType, time: Date, key: string, value: Object) {
		const padding = this.ctx.nestLevel * 4;
		const color = colorForKey(type);
		const first = this.ctx.logEntries.length == 1 && this.ctx.nestLevel == 0;
		const isObject = typeof value == "object";
		const delta = time.getTime() - this.lastTime.getTime();

		if (first) {
			console.log(`${C.blue}+ REQUESTID ${this.id}${C.reset}`);
			console.log(`${C.blue}+ TIMESTAMP ${time.toISOString()}${C.reset}`);
		}

		console.log(
			`${color}${"-".repeat(padding)}| +${delta}ms ${type.toUpperCase()} ${key}: ${isObject ? `${C.cyan}{${C.reset}` : value}${C.reset}`,
		);
		if (isObject) {
			if (type === "sub") {
				return;
			}
			for (const [name, val] of Object.entries(value)) {
				console.log(
					`${C.cyan}${"-".repeat(padding)}|   ${name}: ${val}${C.reset}`,
				);
			}
			console.log(`${C.cyan}${"-".repeat(padding)}| }${C.reset}`);
		}
	}

	private push(type: LogType, key: string, value: Object) {
		const time = new Date();
		this.ctx.logEntries.push({ type, key, value, time });
		this.prettyPrint(type, time, key, value);
		this.lastTime = time;
	}

	public error(key: string, value: Object) {
		this.push("error", key, value);
	}
	public warn(key: string, value: Object) {
		this.push("warn", key, value);
	}
	public info(key: string, value: Object) {
		this.push("info", key, value);
	}
	public debug(key: string, value: Object) {
		this.push("debug", key, value);
	}
	public trace(key: string, value: Object) {
		this.push("trace", key, value);
	}
	private sub(key: string, value: Object) {
		this.push("sub", key, value);
	}

	public nest(title: string) {
		const child = new Logger();
		child.ctx.nestLevel = this.ctx.nestLevel + 1;

		this.ctx.children.push(child);
		this.sub(title, { from: this.id, to: child.id, title });
		return child;
	}

	public get id(): string {
		return this.ctx.id;
	}
}
