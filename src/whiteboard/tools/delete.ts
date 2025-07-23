import * as paper from "paper";
import { model } from "../model";

export namespace Delete {
	export const name = "Delete";

    export function onSelect() {
        paper.view.element.addEventListener("pointerdown", onMouseDown);
    }

    export function onDeselect() {
        paper.view.element.removeEventListener("pointerdown", onMouseDown);
    }

	function onMouseDown(event: PointerEvent) {
		const point = paper.view.projectToView({ x: event.offsetX, y: event.offsetY });

		// find the current shape under the point and remove it
		const hitResult = paper.project.hitTest(point, {
			tolerance: 5,
			fill: true,
			stroke: true,
			segments: false
		});
		if (hitResult && hitResult.item) {
			hitResult.item.remove();
		} else {
			console.log("No shape found at the clicked position.");
		}

		paper.view.update();

	}
}