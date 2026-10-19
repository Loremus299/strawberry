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
	value: unknown;
	time: Date;
}

type LogContext = {
	id: string;
	time: Date;

	logEntries: Array<LogEntry>;
	children: Array<Logger>;

	nestLevel: number;
};

export interface LoggerConfiguration {
	prettyPrint: boolean;
	onEntry: (requestId: Readonly<string>, entry: Readonly<LogEntry>) => void;
	onDump: (
		requestId: Readonly<string>,
		entries: Readonly<Array<LogEntry>>,
	) => Promise<void>;
}

let defaultConfig: LoggerConfiguration = {
	prettyPrint: true,
	onEntry: () => {},
	onDump: async () => {},
};

export function configureLogger(configuration: Partial<LoggerConfiguration>) {
	defaultConfig = { ...defaultConfig, ...configuration };
}

export default class Logger {
	private readonly ctx: LogContext;
	private lastTime: Date;
	private readonly configuration: LoggerConfiguration;

	constructor() {
		this.ctx = {
			id: globalThis.crypto.randomUUID(),
			time: new Date(),

			logEntries: [],
			children: [],
			nestLevel: 0,
		};
		this.lastTime = new Date();
		this.configuration = defaultConfig;
	}

	private prettyPrint(type: LogType, time: Date, key: string, value: unknown) {
		const padding = this.ctx.nestLevel * 4;
		const color = colorForKey(type);
		const first = this.ctx.logEntries.length == 1 && this.ctx.nestLevel == 0;
		const isObject = value != null && typeof value == "object";
		const delta = time.getTime() - this.lastTime.getTime();

		if (first) {
			console.log(`${C.blue}+ REQUESTID ${this.id}${C.reset}`);
			console.log(`${C.blue}+ TIMESTAMP ${time.toISOString()}${C.reset}`);
		}

		console.log(
			`${color}${"-".repeat(padding)}| +${delta}ms ${type.toUpperCase()} ${key}: ${isObject ? `${C.cyan}${type == "sub" ? "" : "{"}${C.reset}` : value}${C.reset}`,
		);

		const printObject = (obj: Object, depth = 0): void => {
			if (obj === null || typeof obj !== "object") return;
			const entries = Object.entries(obj);

			for (const [name, val] of entries) {
				const prefix = `${C.cyan}${"-".repeat(padding)}| ${"  ".repeat(depth + 1)}`;

				if (val !== null && typeof val === "object") {
					console.log(`${prefix}${name}: {${C.reset}`);
					printObject(val, depth + 1);
					console.log(`${prefix}}${C.reset}`);
				} else {
					console.log(`${prefix}${name}: ${String(val)}${C.reset}`);
				}
			}
		};

		if (isObject) {
			if (type === "sub") return;
			printObject(value as Object);
			console.log(`${C.cyan}${"-".repeat(padding)}| }${C.reset}`);
		}
	}

	private push(type: LogType, key: string, value: unknown) {
		const time = new Date();
		this.ctx.logEntries.push({ type, key, value, time });
		this.configuration.onEntry(this.ctx.id, { key, value, type, time });
		{
			this.configuration.prettyPrint &&
				this.prettyPrint(type, time, key, value);
		}
		this.lastTime = time;
	}

	public error(key: string, value: unknown) {
		this.push("error", key, value);
	}
	public warn(key: string, value: unknown) {
		this.push("warn", key, value);
	}
	public info(key: string, value: unknown) {
		this.push("info", key, value);
	}
	public debug(key: string, value: unknown) {
		this.push("debug", key, value);
	}
	public trace(key: string, value: unknown) {
		this.push("trace", key, value);
	}
	private sub(key: string, value: unknown) {
		this.push("sub", key, value);
	}

	public nest(title: string) {
		const child = new Logger();
		child.ctx.nestLevel = this.ctx.nestLevel + 1;

		this.ctx.children.push(child);
		this.sub(title, { from: this.id, to: child.id, title });
		return child;
	}

	private async dumpLogger(logger: Logger) {
		await this.configuration.onDump(logger.id, logger.ctx.logEntries);
		for (const child of logger.ctx.children) {
			await this.dumpLogger(child);
		}
	}

	public async dump() {
		await this.dumpLogger(this);
	}

	public get id(): string {
		return this.ctx.id;
	}
}
