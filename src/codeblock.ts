import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	setIcon,
} from "obsidian";
import MindElixir, { Options } from "mind-elixir";
import { downloadImage } from "@mind-elixir/export-mindmap";
import type MindMapPlugin from "./main";
import { parsePlaintext } from "./parser";
import { handleMindmapClick, processMarkdownContent } from "./utils";

/** Smallest height (px) an embedded mind map container shrinks to. */
const MIN_CONTAINER_HEIGHT = 90;
/**
 * Gap (px) kept between the visible topics and the frame. The resize grip is
 * shorter than this gap, so it never sits on top of the map itself.
 */
const CONTENT_VERTICAL_PADDING = 14;
/** Gap (px) kept on the left or right edge for left and right alignment. */
const CONTENT_HORIZONTAL_PADDING = 14;
/** Height (px) of the bottom resize grip, kept below the content. */
const RESIZE_HANDLE_HEIGHT = 10;
/** Delay (ms) before rendering so Obsidian has laid the code block out. */
const INIT_DELAY_MS = 100;
/** Elements that make up the visible mind map, used to measure its bounds. */
const CONTENT_SELECTOR = ".me-tpc, .me-epd, .svg-label";

/**
 * Members of a Mind Elixir instance used to fit and place the map. They exist
 * at runtime but are not all part of the published type surface, so they are
 * read through this interface.
 */
interface MindElixirLayout {
	nodes?: HTMLElement;
	/** The scaled canvas holding the topics, that is, the .map-canvas element. */
	map?: HTMLElement;
	toCenter?: () => void;
	scaleVal?: number;
}

/** Rendered bounds of the visible map, relative to the frame's top left. */
interface ContentBounds {
	top: number;
	bottom: number;
	left: number;
	right: number;
	height: number;
	containerWidth: number;
	containerHeight: number;
}

export interface MindElixirContainer extends HTMLDivElement {
	mindElixirInstance?: MindElixir;
	mindmapBlock?: MindmapCodeBlock;
}

/**
 * Renders a mindelixir code block and keeps its frame sized to the rendered
 * map, so short maps no longer sit in a large empty box. The bottom edge can be
 * dragged to size the frame by hand, and double-clicking that edge restores
 * automatic sizing.
 */
export class MindmapCodeBlock extends MarkdownRenderChild {
	private mind: MindElixir | null = null;
	private mapEl: HTMLElement | null = null;
	/** While true, the container height follows the rendered content. */
	private autoFit = true;
	private resizeObserver: ResizeObserver | null = null;
	private initTimer: number | null = null;
	private fitFrame: number | null = null;
	private redrawFrame: number | null = null;

	constructor(
		private readonly plugin: MindMapPlugin,
		containerEl: HTMLElement,
		private readonly source: string,
		private readonly ctx: MarkdownPostProcessorContext,
	) {
		super(containerEl);
	}

	onload(): void {
		const mapEl = this.containerEl.createDiv({
			cls: "mindelixir-codeblock-container",
		});
		mapEl.setAttribute("data-ignore-swipe", "true");
		// Guarantees the positioning and clipping the frame relies on, even if
		// an older styles.css is still installed next to this build.
		mapEl.setCssStyles({ position: "relative", overflow: "hidden" });
		this.mapEl = mapEl;
		(mapEl as MindElixirContainer).mindmapBlock = this;

		// Resolve internal links relative to the note holding the code block.
		mapEl.addEventListener("click", (e) => {
			handleMindmapClick(this.plugin.app, e, this.ctx.sourcePath);
		});

		this.createExportButton(mapEl);
		this.createResizeHandle(mapEl);

		this.initTimer = window.setTimeout(() => this.render(), INIT_DELAY_MS);
	}

	onunload(): void {
		if (this.initTimer !== null) {
			window.clearTimeout(this.initTimer);
			this.initTimer = null;
		}
		if (this.fitFrame !== null) {
			cancelAnimationFrame(this.fitFrame);
			this.fitFrame = null;
		}
		if (this.redrawFrame !== null) {
			cancelAnimationFrame(this.redrawFrame);
			this.redrawFrame = null;
		}
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.mind?.destroy();
		this.mind = null;
	}

	/** Re-fits and re-positions the map, for example after a setting change. */
	relayout(): void {
		this.scheduleFit();
	}

	private render(): void {
		const mapEl = this.mapEl;
		if (!mapEl) return;

		try {
			const isDark = activeDocument.body.classList.contains("theme-dark");
			const options: Options = {
				el: mapEl,
				direction: MindElixir.RIGHT,
				editable: false,
				contextMenu: false,
				toolBar: false,
				keypress: false,
				theme: isDark ? MindElixir.DARK_THEME : MindElixir.THEME,
				markdown: (str) =>
					processMarkdownContent(str, this.ctx.sourcePath),
			};
			const mind = new MindElixir(options);
			this.mind = mind;
			(mapEl as MindElixirContainer).mindElixirInstance = mind;

			// Redraw links and refit whenever an image finishes (un)loading.
			this.registerDomEvent(mapEl, "load", this.handleMediaEvent, true);
			this.registerDomEvent(mapEl, "error", this.handleMediaEvent, true);

			void mind
				.init(parsePlaintext(this.source, "Mind Map"))
				.then((err) => {
					if (err) {
						console.error(
							"Error rendering mindelixir code block:",
							err,
						);
						return;
					}
					this.observeContent();
					this.scheduleFit();
				});
		} catch (error) {
			console.error("Error rendering mindelixir code block:", error);
			mapEl.createEl("p", {
				text: "Error rendering mind map. Check console for details.",
				cls: "mindelixir-error",
			});
		}
	}

	/**
	 * Watches the map content so the frame follows folding, unfolding and any
	 * other change to the size of the rendered topics.
	 */
	private observeContent(): void {
		const nodes = this.contentEl();
		if (!nodes || typeof ResizeObserver === "undefined") return;
		this.resizeObserver?.disconnect();
		this.resizeObserver = new ResizeObserver(() => this.scheduleFit());
		this.resizeObserver.observe(nodes);
	}

	private contentEl(): HTMLElement | undefined {
		return (this.mind as unknown as MindElixirLayout | null)?.nodes;
	}

	private canvasEl(): HTMLElement | undefined {
		return (this.mind as unknown as MindElixirLayout | null)?.map;
	}

	private scaleValue(): number {
		const scale = (this.mind as unknown as MindElixirLayout | null)?.scaleVal;
		return scale && scale > 0 ? scale : 1;
	}

	/**
	 * Sizes the frame to the rendered map, then places it, so a small map gets
	 * a small frame. Skipped once the user has dragged the frame to a size of
	 * their own.
	 */
	private fitToContent(): void {
		const mapEl = this.mapEl;
		if (!mapEl || !this.autoFit) return;

		const bounds = this.measureContent(mapEl);
		if (!bounds) return;

		const target = Math.max(
			MIN_CONTAINER_HEIGHT,
			Math.round(bounds.height / this.scaleValue()) +
				CONTENT_VERTICAL_PADDING * 2,
		);
		if (Math.abs(mapEl.offsetHeight - target) > 1) {
			mapEl.style.height = target + "px";
		}

		this.applyContentLayout();
	}

	/**
	 * Places the visible topics inside the frame: vertically centered, and
	 * horizontally at the position chosen in the settings.
	 *
	 * Mind Elixir centers its canvas, but that canvas carries more empty space
	 * below the topics than above them (topic margins and vertical-align
	 * spacing), so centering the canvas alone leaves the map a few pixels low.
	 * The remaining offset is measured and removed with a translate on the
	 * canvas, which is also what applies the horizontal alignment.
	 */
	private applyContentLayout(): void {
		const mapEl = this.mapEl;
		if (!mapEl) return;
		const canvas = this.canvasEl();

		// Drop the previous correction so the measurement starts from Mind
		// Elixir's own centering.
		canvas?.style.removeProperty("translate");
		this.recenter();

		const bounds = this.measureContent(mapEl);
		if (!bounds || !canvas) return;

		const shiftY = (bounds.top - (bounds.containerHeight - bounds.bottom)) / 2;
		const shiftX = this.horizontalShift(bounds);
		if (Math.abs(shiftX) < 0.5 && Math.abs(shiftY) < 0.5) return;

		// The individual translate property is composed on top of Mind Elixir's
		// transform, so the canvas can be nudged without touching its matrix.
		canvas.style.setProperty(
			"translate",
			-shiftX + "px " + -shiftY + "px",
		);
	}

	/**
	 * How far the canvas has to move horizontally for the configured content
	 * position. A positive result means the map sits too far left.
	 */
	private horizontalShift(bounds: ContentBounds): number {
		const gapLeft = bounds.left;
		const gapRight = bounds.containerWidth - bounds.right;
		const alignment = this.plugin.settings.contentAlignment;

		if (alignment === "right") {
			return CONTENT_HORIZONTAL_PADDING - gapRight;
		}
		if (alignment === "center") {
			return (gapLeft - gapRight) / 2;
		}
		// "left" is the default, and the fallback for an unknown stored value.
		return gapLeft - CONTENT_HORIZONTAL_PADDING;
	}

	private recenter(): void {
		(this.mind as unknown as MindElixirLayout | null)?.toCenter?.();
	}

	/**
	 * Bounds of the visible topics, relative to the frame's top left corner.
	 * Mind Elixir pads its canvas generously (--map-padding 50px plus the root
	 * and main margins add up to over 200px), so the topic elements are measured
	 * instead of the canvas.
	 */
	private measureContent(mapEl: HTMLElement): ContentBounds | null {
		const containerRect = mapEl.getBoundingClientRect();
		let top = Number.POSITIVE_INFINITY;
		let bottom = Number.NEGATIVE_INFINITY;
		let left = Number.POSITIVE_INFINITY;
		let right = Number.NEGATIVE_INFINITY;
		let found = false;

		mapEl.querySelectorAll<HTMLElement>(CONTENT_SELECTOR).forEach((topic) => {
			const rect = topic.getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) return;
			found = true;
			top = Math.min(top, rect.top - containerRect.top);
			bottom = Math.max(bottom, rect.bottom - containerRect.top);
			left = Math.min(left, rect.left - containerRect.left);
			right = Math.max(right, rect.right - containerRect.left);
		});

		if (!found) return null;
		if (!Number.isFinite(top) || !Number.isFinite(bottom)) return null;
		if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
		if (bottom <= top) return null;

		return {
			top,
			bottom,
			left,
			right,
			height: bottom - top,
			containerWidth: containerRect.width,
			containerHeight: containerRect.height,
		};
	}

	private scheduleFit(): void {
		if (this.fitFrame !== null) return;
		this.fitFrame = window.requestAnimationFrame(() => {
			this.fitFrame = null;
			this.fitToContent();
		});
	}

	private readonly handleMediaEvent = (ev: Event): void => {
		const target = ev.target as HTMLElement | null;
		if (!target || target.tagName !== "IMG") return;
		if (this.redrawFrame !== null) {
			cancelAnimationFrame(this.redrawFrame);
		}
		this.redrawFrame = window.requestAnimationFrame(() => {
			this.redrawFrame = null;
			this.mind?.linkDiv();
			this.scheduleFit();
		});
	};

	private createExportButton(mapEl: HTMLElement): void {
		const exportBtn = mapEl.createDiv({ cls: "mindelixir-export-btn" });
		exportBtn.setAttribute("aria-label", "Export as image");
		setIcon(exportBtn, "download");
		exportBtn.onclick = (e) => {
			e.stopPropagation();
			if (this.mind) {
				void downloadImage(this.mind, "png");
			}
		};
	}

	/**
	 * Adds the bottom-edge grip used to size the frame by hand.
	 * Double-clicking it restores automatic sizing. The styles are applied here
	 * rather than in styles.css so the grip stays visible even when an older
	 * styles.css is still installed alongside this build.
	 */
	private createResizeHandle(mapEl: HTMLElement): void {
		const handle = mapEl.createDiv({ cls: "mindelixir-resize-handle" });
		handle.setAttribute("aria-label", "Drag to resize the mind map");
		handle.setAttribute(
			"title",
			"Drag to resize, double-click to fit the content",
		);
		handle.setCssStyles({
			position: "absolute",
			left: "50%",
			bottom: "0",
			zIndex: "220",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			width: "64px",
			height: RESIZE_HANDLE_HEIGHT + "px",
			transform: "translateX(-50%)",
			cursor: "ns-resize",
			touchAction: "none",
			opacity: "0.45",
			borderRadius: "4px 4px 0 0",
			backgroundColor: "var(--background-modifier-border)",
			transition:
				"opacity 0.15s ease-in-out, background-color 0.15s ease-in-out",
		});

		const grip = handle.createDiv({ cls: "mindelixir-resize-grip" });
		grip.setCssStyles({
			width: "28px",
			height: "2px",
			borderRadius: "1px",
			backgroundColor: "var(--text-faint)",
			pointerEvents: "none",
		});

		const highlight = (active: boolean) => {
			handle.style.opacity = active ? "1" : "0.45";
			handle.style.backgroundColor = active
				? "var(--background-modifier-hover)"
				: "var(--background-modifier-border)";
			grip.style.backgroundColor = active
				? "var(--text-normal)"
				: "var(--text-faint)";
		};
		handle.addEventListener("mouseenter", () => highlight(true));
		handle.addEventListener("mouseleave", () => highlight(false));
		handle.addEventListener("pointerdown", (ev) => {
			this.startResize(ev, handle);
		});
		handle.addEventListener("dblclick", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();
			this.autoFit = true;
			mapEl.removeClass("is-manually-sized");
			this.scheduleFit();
		});
	}

	private startResize(ev: PointerEvent, handle: HTMLElement): void {
		const mapEl = this.mapEl;
		if (!mapEl || ev.button !== 0) return;

		// Keep the drag away from Mind Elixir's own panning and selection.
		ev.preventDefault();
		ev.stopPropagation();

		this.autoFit = false;
		mapEl.addClass("is-manually-sized");

		const startY = ev.clientY;
		const startHeight = mapEl.offsetHeight;
		handle.setPointerCapture(ev.pointerId);

		const onMove = (moveEv: PointerEvent) => {
			const next = Math.max(
				MIN_CONTAINER_HEIGHT,
				Math.round(startHeight + moveEv.clientY - startY),
			);
			mapEl.style.height = next + "px";
			this.applyContentLayout();
		};
		const onEnd = (endEv: PointerEvent) => {
			handle.removeEventListener("pointermove", onMove);
			handle.removeEventListener("pointerup", onEnd);
			handle.removeEventListener("pointercancel", onEnd);
			if (handle.hasPointerCapture(endEv.pointerId)) {
				handle.releasePointerCapture(endEv.pointerId);
			}
			this.applyContentLayout();
		};

		handle.addEventListener("pointermove", onMove);
		handle.addEventListener("pointerup", onEnd);
		handle.addEventListener("pointercancel", onEnd);
	}
}
