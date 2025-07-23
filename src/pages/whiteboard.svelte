<script lang="ts">
	import { onMount } from "svelte";
	import * as paper from "paper";
	import { Size } from "paper/dist/paper-core";
	import Palette from "../whiteboard/palette.svelte";
	import {
		type Command,
		CommandPriority,
		commandStream,
		type ForegroundColorCommand,
		type OpenDialogCommand,
		type SelectToolCommand,
		startLogging,
	} from "../whiteboard/command";
	import { type CommandSubscription } from "../command-controller";
	import { model } from "../whiteboard/model";
	import { ToolController } from "../whiteboard/tools/tool.controller";
	import { ModelController } from "../whiteboard/model-controller";
	import { Freehand } from "../whiteboard/tools/freehand";
	import { Line } from "../whiteboard/tools/line";
    import { Delete } from "../whiteboard/tools/delete";

	let canvas: HTMLCanvasElement;
	let container: HTMLElement;
	let toolboxColor: HTMLElement;

	let subscription: CommandSubscription;

	let currentColor = "#ff0000";
	let currentTool = undefined;

	onMount(() => {
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);

		currentColor = model.foregroundColor;
		currentTool = model.selectedTool;

		window.addEventListener("resize", onResize);

		commandStream.subscribe(onCommand, CommandPriority.UI);
		startLogging();

		ToolController.init();
		ModelController.startUpdatingModel();

		return () => {
			window.removeEventListener("resize", onResize);
			subscription.unsubscribe();
			ToolController.destroy();
			ModelController.stopUpdatingModel();
		};
	});

	function onCommand(c: Command) {
		switch (c.type) {
			case "FOREGROUND_COLOR":
				currentColor = model.foregroundColor;
				break;
			case "SELECT_TOOL":
				currentTool = model.selectedTool;
				break;
		}
	}

	function openColorPalette() {
		let rect = toolboxColor.getBoundingClientRect();

		commandStream.root(<OpenDialogCommand>{
			type: "OPEN_COLOR_PALETTE",
			minX: rect.x,
			maxX: rect.x + rect.width,
			y: rect.y + rect.height,
		});
	}

	function selectTool(name: string) {
		if (model.selectedTool == name) {
			return;
		}

		commandStream.root(<SelectToolCommand>{
			type: "SELECT_TOOL",
			name,
		});
	}

	function onResize() {
		paper.view.viewSize = new Size(
			container.clientWidth,
			container.clientHeight,
		);
	}
</script>

<whiteboard>
	<div id="toolbox">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class:selected={currentTool == Freehand.name}
			on:click={() => selectTool(Freehand.name)}
		>
			<svg
				width="50"
				height="50"
				viewBox="0 0 50 50"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="5.7" cy="5.9" r="3.7" />
				<circle cx="44.6" cy="44.5" r="3.7" />
				<path d="M 6.3,8.9 C 10.3,58.2 39.6,-6.6 44.2,42.3" />
			</svg>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class:selected={currentTool == Line.name}
			on:click={() => selectTool(Line.name)}
		>
			<svg
				width="50"
				height="50"
				viewBox="0 0 50 50"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="5.7" cy="5.9" r="3.7" />
				<circle cx="44.6" cy="44.5" r="3.7" />
				<path d="M 5.9,6.3 C 43.3,43.6 6,6.8 44.5,44.4" />
			</svg>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class:selected={currentTool == Delete.name}
			on:click={() => selectTool(Delete.name)}
		>
			<svg
				width="50"
				height="50"
				viewBox="0 0 50 50"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M 10,28 31.9,4.9 44.4,16.8 22.4,39.9 Z" style="fill:white"
				/>
				<path
					d="M 9.3,28.6 C -0.9,39.3 12,50.8 21.8,40.5"
				/>
			</svg>
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div bind:this={toolboxColor} id="color" on:click={openColorPalette}>
			<div style="background-color: {currentColor};"></div>
		</div>
	</div>
	<Palette />
	<div id="container" bind:this={container}>
		<canvas bind:this={canvas}></canvas>
	</div>
</whiteboard>

<style lang="scss">
	whiteboard {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	#container {
		width: 100%;
		height: 100%;
		overflow: hidden;

		canvas {
			width: 100%;
			height: 100%;
			background-color: black;
			touch-action: none;
		}
	}

	#toolbox {
		display: flex;
		flex-direction: row;
		padding: 5px;
		gap: 5px;
		background-color: #333;

		& > div {
			box-sizing: border-box;
			width: 50px;
			height: 50px;
			padding: 5px;
			cursor: pointer;
			border-radius: 5px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: white;
			font-size: 2em;
		}

		.selected {
			border: 1px solid lightblue;
		}

		svg {
			fill: white;
			stroke: none;

			path {
				stroke: white;
				fill: none;
				stroke-width: 2.5;
			}
		}

		#color {
			border: 1px solid lightblue;
			margin-left: auto;

			div {
				width: 100%;
				height: 100%;
				border-radius: 5px;
			}
		}
	}
</style>
