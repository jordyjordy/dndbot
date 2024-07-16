import React, { useEffect, useRef, useState, MouseEvent } from 'react';
import './DraggableList.scss';

interface DraggableListProps<T> {
    itemKey: keyof T
    list?: T[]
    template: ({ item, index }: { item: T, action: (index: number) => void, index: number }) => JSX.Element
    onPositionSwap?: (oldIndex: number, newIndex: number) => void
    onDragFinish?: (newItems: T[]) => void
    className?: string
    action: (index: number) => void
}

export function DraggableList<T> ({
    itemKey, template: Template, list, onDragFinish, className, action,
}: DraggableListProps<T>): JSX.Element {
    const [draggedItems, setDraggedItems] = useState(list ?? []);
    useEffect(() => {
        setDraggedItems([...list ?? []]);
    }, [list]);

    const [dragged, setDragged] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const mouseUp = useRef<(e: any) => void>();
    const mouseMove = useRef<(e: any) => void>();

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

    return (
        <div ref={containerRef} className={`draggable-list ${className ?? ''}`}>
            {draggedItems.map((item, index) => {
                return (
                    <div onMouseOver={(e) => { handleMouseOver(e, index); }} className={`${index === dragged ? 'hidden-el' : ''}`} key={item[itemKey] as string}>
                        <Template item={item} index={index} action={action} />
                    </div>
                );
            })}
            {dragged !== null && (
                <div className="dragged-el">
                    <Template item={draggedItems[dragged]} index={dragged} action={action} />
                </div>
            )}
        </div>
    );
};
