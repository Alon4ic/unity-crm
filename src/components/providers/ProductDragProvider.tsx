'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PropsWithChildren } from 'react';

export default function ProductDragProvider({ children }: PropsWithChildren) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}