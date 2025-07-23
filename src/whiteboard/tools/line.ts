import * as paper from "paper";
import { model } from "../model";

export namespace Line {
	let currentPath: paper.Path | null = null;

	export const name = "Line";

    export function onSelect() {
        paper.view.element.addEventListener("pointerdown", onMouseDown);
    }

    export function onDeselect() {
        paper.view.element.removeEventListener("pointerdown", onMouseDown);
    }

	function onMouseDown(event: PointerEvent) {
		console.log('line')
		const point = paper.view.projectToView({ x: event.offsetX, y: event.offsetY });

		if (currentPath) {
			currentPath.remove();
		}

		currentPath = new paper.Path();
		currentPath.strokeColor = new paper.Color(model.foregroundColor);
		currentPath.strokeWidth = 2;
		currentPath.add(point);
		currentPath.add(point);

		paper.view.update();

		paper.view.element.addEventListener("pointermove", onMouseMove);
		paper.view.element.addEventListener("pointerup", onMouseUp);
	}

	function onMouseMove(event: PointerEvent) {
		const point = paper.view.projectToView({ x: event.offsetX, y: event.offsetY });
		
		if (currentPath) {
			currentPath.lastSegment.point = point;
			paper.view.update();
		}
	}

	function onMouseUp() {
		if (currentPath) {
			currentPath = null;
		}

		paper.view.element.removeEventListener("pointermove", onMouseMove);
		paper.view.element.removeEventListener("pointerup", onMouseUp);
	}
}