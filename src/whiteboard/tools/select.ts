import * as paper from "paper";
import { model } from "../model";

export namespace Select {
	let lassoPath: paper.Path | null = null;
	let dragOffset: paper.Point | null = null;

	let resizeOverlayGroup: paper.Group | null = null;
	let resizeHandleIndex: number | null = null;

	let selectedItemsGroup: paper.Group | null = null;

	export const name = "Select";

	export function onSelect() {
		paper.view.element.addEventListener("pointerdown", onPointerDown);
	}

	export function onDeselect() {
		deselectAll();
		paper.view.element.removeEventListener("pointerdown", onPointerDown);
	}

	function onPointerDown(event: PointerEvent) {
		const startPoint = new paper.Point(event.offsetX, event.offsetY);

		if (resizeOverlayGroup) {
			const handles = resizeOverlayGroup.children.slice(1); // first child is the red box
			for (let i = 0; i < handles.length; i++) {
				const hit = handles[i].hitTest(startPoint, { fill: true, stroke: true, tolerance: 6 });
				if (hit) {
					resizeHandleIndex = i;
					paper.view.element.addEventListener('pointermove', onResizeMove);
					paper.view.element.addEventListener('pointerup', onResizeUp);
					return;
				}
			}
		}

		let hitSelected = paper.project.selectedItems.some(item =>
			item.hitTest(startPoint, { fill: true, stroke: true, tolerance: 10 }));

		if (hitSelected) {
			dragOffset = startPoint;

			//hide the resize box while dragging
			resizeOverlayGroup.remove();
			resizeOverlayGroup = null;
		} else {
			lassoPath = new paper.Path({
				segments: [startPoint],
				strokeColor: 'blue',
				strokeWidth: 1
			});
		}

		paper.view.element.addEventListener('pointermove', onPointerMove);
		paper.view.element.addEventListener('pointerup', onPointerUp);
	}

	function onResizeMove(event: PointerEvent) {
		const currentPoint = new paper.Point(event.offsetX, event.offsetY);
		const initialBounds = resizeOverlayGroup.children[0].bounds;

		let anchor: paper.Point;
		switch (resizeHandleIndex) {
			case 0: anchor = initialBounds.bottomRight; break;
			case 1: anchor = initialBounds.bottomLeft; break;
			case 2: anchor = initialBounds.topLeft; break;
			case 3: anchor = initialBounds.topRight; break;
		}

		let newBounds = new paper.Rectangle(anchor, currentPoint);

		const scaleX = newBounds.width / initialBounds.width;
		const scaleY = newBounds.height / initialBounds.height;
		const center = initialBounds.center;

		const relative = selectedItemsGroup.bounds.center.subtract(center);
		const scaled = new paper.Point(relative.x * scaleX, relative.y * scaleY);
		selectedItemsGroup.position = center.add(scaled);
		selectedItemsGroup.scale(scaleX, scaleY, center);

		drawSelectionBox();
	}

	function onResizeUp() {
		resizeHandleIndex = null;
		paper.view.element.removeEventListener('pointermove', onResizeMove);
		paper.view.element.removeEventListener('pointerup', onResizeUp);
	}

	function onPointerMove(event: PointerEvent) {
		if (dragOffset) {
			const point = new paper.Point(event.offsetX, event.offsetY);
			const delta = point.subtract(dragOffset);
			dragOffset = point;

			selectedItemsGroup.position = selectedItemsGroup.position.add(delta);
		} else {
			const point = new paper.Point(event.offsetX, event.offsetY);
			lassoPath.add(point);
		}
	}

	function onPointerUp(event: PointerEvent) {
		paper.view.element.removeEventListener('pointermove', onPointerMove);
		paper.view.element.removeEventListener('pointerup', onPointerUp);

		if (dragOffset) {
			dragOffset = null;

			//reshow the selection box
			drawSelectionBox();
		} else {
			const pathLength = lassoPath.length;
			if (pathLength <= 20) {
				// Considered a tap
				const lastPoint = lassoPath.lastSegment.point;

				// remove lassoPath first, otherwise we'll select itself
				lassoPath.remove();
				const hitResult = paper.project.hitTest(lastPoint, { fill: true, stroke: true, tolerance: 10 });

				if (hitResult?.item) {
					selectShape(hitResult.item);
				} else {
					deselectAll();
				}
			} else {
				// Considered a drag/lasso
				lassoPath.closed = true;
				selectShapesInPath(lassoPath);
			}

			lassoPath.remove();
			lassoPath = null;
		}
	}

	function selectShape(item: paper.Item) {
		deselectAll();

		selectedItemsGroup = new paper.Group();
		item.selected = true;
		selectedItemsGroup.addChild(item);
		drawSelectionBox();
	}

	function selectShapesInPath(path: paper.Path) {
		deselectAll();

		let selected = paper.project.activeLayer.children.filter(item =>
			item != path
			&& item instanceof paper.PathItem
			&& path.contains(item.bounds.center));

		if (selected.length == 0) {
			return;
		}

		selectedItemsGroup = new paper.Group(selected);

		selected.forEach(x => {
			x.selected = true;
		});

		drawSelectionBox();
	}

	function deselectAll() {
		if (selectedItemsGroup) {
			selectedItemsGroup.children.forEach(item => {
				item.selected = false;
			});

			paper.project.activeLayer.addChildren(selectedItemsGroup.children);

			selectedItemsGroup.remove();
			selectedItemsGroup = null;
		}

		if (resizeOverlayGroup) {
			resizeOverlayGroup.remove();
			resizeOverlayGroup = null;
		}
	}

	function drawSelectionBox() {
		const groupBounds = selectedItemsGroup.bounds;
		const corners = [
			groupBounds.topLeft,
			groupBounds.topRight,
			groupBounds.bottomRight,
			groupBounds.bottomLeft
		];

		if (resizeOverlayGroup) {
			resizeOverlayGroup.children[0].bounds = groupBounds;

			resizeOverlayGroup.children.slice(1).forEach((Item, i) => {
				Item.position = corners[i]
			})
		} else {
			resizeOverlayGroup = new paper.Group();
			resizeOverlayGroup.addChild(new paper.Path.Rectangle({
				rectangle: groupBounds,
				strokeColor: 'red',
				dashArray: [4, 2],
				strokeWidth: 1,
				fullySelected: false
			}));

			const size = 8;
			resizeOverlayGroup.addChildren(corners.map(corner =>
				new paper.Path.Rectangle({
					point: corner.subtract(new paper.Point(size / 2, size / 2)),
					size: new paper.Size(size, size),
					fillColor: 'white',
					strokeColor: 'black',
					strokeWidth: 1
				})));
		}
	}
}