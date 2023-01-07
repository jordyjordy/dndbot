import React, { useEffect, useRef, useState, MouseEvent, MouseEventHandler } from 'react';
import './DraggableList.scss';

interface DragHandleProps {
    onMouseDown: MouseEventHandler<HTMLDivElement>
}

interface DraggableListProps<T> {
    itemKey: keyof T
    list?: T[]
    template: ({ item, dragHandleProps, index }: { item: T, dragHandleProps: DragHandleProps, index: number }) => JSX.Element
    onPositionSwap?: (oldIndex: number, newIndex: number) => void
    onDragFinish?: (newItems: T[]) => void
}

export function DraggableList<T> ({ itemKey, template: Template, list, onPositionSwap, onDragFinish }: DraggableListProps<T>): JSX.Element {
    const [draggedItems, setDraggedItems] = useState(list ?? []);
    useEffect(() => {
        setDraggedItems([...list ?? []]);
    }, [list]);

    const [dragged, setDragged] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseY, setMouseY] = useState(0);
    const [offset, setOffset] = useState(0);

    const mouseUp = useRef<(e: any) => void>();
    const mouseMove = useRef<(e: any) => void>();

    const draggedStyle = {
        top: `${mouseY - offset - 13}px`,
    };

    const handleMouseMove = (e: any): void => {
        const containerPos = containerRef?.current?.getBoundingClientRect();
        setMouseY(e.pageY - (containerPos?.top ?? 0));
    };

    const handleMouseOver = (e: MouseEvent, index: number): void => {
        if (index !== dragged && dragged !== null) {
            const newItems = [...draggedItems];
            const start = draggedItems[dragged];
            const end = draggedItems[index];
            newItems[index] = start;
            newItems[dragged] = end;
            setDraggedItems(newItems);
            setDragged(index);
        }
    };

    useEffect(() => {
        if (dragged !== null) {
            if (mouseUp.current !== undefined) {
                window.removeEventListener('mouseup', mouseUp.current);
            };
            const onMouseUp = (e: any): void => {
                handleMouseUp();
            };
            mouseUp.current = onMouseUp;
            window.addEventListener('mouseup', mouseUp.current);
        }
    }, [dragged, draggedItems]);

    const handleMouseUp = (): void => {
        if (mouseMove.current !== undefined) {
            window.removeEventListener('mousemove', mouseMove.current);
        }
        if (mouseUp.current !== undefined) {
            window.removeEventListener('mouseup', mouseUp.current);
        }
        setDragged(null);
        onDragFinish?.(draggedItems);
    };

    const handleMouseDown = (e: MouseEvent, index: number): void => {
        setDragged(index);
        const containerPos = containerRef?.current?.getBoundingClientRect();
        setOffset(e.pageY - e.currentTarget.getBoundingClientRect()?.top);
        setMouseY(e.pageY - (containerPos?.top ?? 0));
        const onMouseMove = (e: any): void => {
            handleMouseMove(e);
        };

        const onMouseUp = (e: any): void => {
            handleMouseUp();
        };

        mouseUp.current = onMouseUp;
        mouseMove.current = onMouseMove;

        window.addEventListener('mousemove', onMouseMove);

        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div ref={containerRef} className='draggable-list'>
            {draggedItems.map((item, index) => {
                return (
                    <div onMouseOver={(e) => { handleMouseOver(e, index); }} className={`${index === dragged ? 'hidden-el' : ''}`} key={item[itemKey] as string}>
                        <Template item={item} index={index} dragHandleProps={{ onMouseDown: (e) => { handleMouseDown(e, index); } }} />
                    </div>
                );
            })}
            {dragged !== null && (
                <div className="dragged-el" style={draggedStyle}>
                    <Template item={draggedItems[dragged]} index={dragged} dragHandleProps={{ onMouseDown: () => {} }} />
                </div>
            )}
        </div>
    );
};
