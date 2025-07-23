import * as paper from "paper";
import { model } from "../model";

export namespace Freehand {
	let currentPath: paper.Path | null = null;

	export const name = "FreeHand";

    export function onSelect() {
        paper.view.element.addEventListener("pointerdown", onMouseDown);
    }

    export function onDeselect() {
        paper.view.element.removeEventListener("pointerdown", onMouseDown);
    }

	function onMouseDown(event: PointerEvent) {
		console.log('free')
		const point = paper.view.projectToView({ x: event.offsetX, y: event.offsetY });

		if (currentPath) {
			currentPath.remove();
		}

		currentPath = new paper.Path();
		currentPath.strokeColor = new paper.Color(model.foregroundColor);
		currentPath.strokeWidth = 2;
		currentPath.add(point);

		paper.view.update();

		paper.view.element.addEventListener("pointermove", onMouseMove);
		paper.view.element.addEventListener("pointerup", onMouseUp);
	}

	function onMouseMove(event: PointerEvent) {
		const point = paper.view.projectToView({ x: event.offsetX, y: event.offsetY });
		
		if (currentPath) {
			currentPath.add(point);
			paper.view.update();
		}
	}

	function onMouseUp() {
		if (currentPath) {
			currentPath.simplify();
			currentPath = null;
		}

		paper.view.element.removeEventListener("pointermove", onMouseMove);
		paper.view.element.removeEventListener("pointerup", onMouseUp);
	}
}